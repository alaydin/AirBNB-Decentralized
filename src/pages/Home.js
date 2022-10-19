import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import bg from "../images/frontpagebg.png";
import logo from "../images/airbnb.png";
import { ConnectButton, Icon, Select, DatePicker, Input, Button, useNotification } from "web3uikit";
import { useState, useEffect, useForm } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";


const Home = () => {
  const airbnbContractAddress = "0x79A03546D8dA05Ca73070254aaa9ac2EbFD01544";
  const { Moralis, account } = useMoralis();
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [destination, setDestination] = useState("New York");
  const [guests, setGuests] = useState(2);
  const [values, setValues] = useState({});
  const dispatch = useNotification();
  const contractProcessor = useWeb3ExecuteFunction();

  const addRentalsAbi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "lat",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "long",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "unoDescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "dosDescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "imgUrl",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "maxGuests",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "pricePerDay",
          "type": "uint256"
        }
      ],
      "name": "addRentals",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  const removeRentalAbi = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "removeRental",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  const handleChange = e => {
    setValues(oldValues => ({
      ...oldValues,
      [e.target.name]: e.target.value
    }));
    //console.log(e);
  };

  const handleNoAccount= () => {
    console.log("no account");
    dispatch({
      type: "error",
      message: `You need to connect your wallet to book a rental`,
      title: "Not Connected",
      position: "topL",
    });
  };

  const handleSuccess= () => {
    dispatch({
      type: "success",
      message: "",
      title: "Transaction sent successfully. Check your wallet to see details.",
      position: "topL",
    });
  };

  const handleError= (msg) => {
    dispatch({
      type: "error",
      message: `${msg}`,
      title: "Booking Failed",
      position: "topL",
    });
  };

  const addRental = async function(name, city, lat, long, unoDescription, dosDescription, imgUrl, maxGuests, pricePerDay) {
    const intMaxguests = parseInt(maxGuests, 10);
    const intPrice = parseInt(pricePerDay, 10);
    await contractProcessor.fetch({
      params: {
        contractAddress: airbnbContractAddress,
        functionName: "addRentals",
        abi: addRentalsAbi,
        params: {
          name: name,
          city: city,
          lat: lat,
          long: long,
          unoDescription: unoDescription,
          dosDescription: dosDescription,
          imgUrl: imgUrl,
          maxGuests: intMaxguests,
          pricePerDay: intPrice
        }
      },
      onSuccess: () => {
        handleSuccess();
      },
      onError: (error) => {
        handleError(error.message);
      }
    });
  }

  const removeRental = async function(id) {
    await contractProcessor.fetch({
      params: {
        contractAddress: airbnbContractAddress,
        functionName: "removeRental",
        abi: removeRentalAbi,
        params: {
          id: id
        }
      },
      onSuccess: async () => {
        handleSuccess();
          const Rentals = Moralis.Object.extend("Rentals");
          const rentalQuery = new Moralis.Query(Rentals);
          rentalQuery.equalTo("uid", id);
          const queryResults = await rentalQuery.first();
          if (queryResults) {
            queryResults.destroy().then(() => {
              console.log('The rental is deleted from Rentals.');
            }, (error) => {
              console.log(error);
            });
          }
      },
      onError: (error) => {
        handleError(error.message);
      }
    });
  }

  return (
    <>
      <div className="container" style={{ backgroundImage: `url(${bg})` }}>
        <div className="containerGradinet"></div>
      </div>
      <div className="topBanner">
        <div>
          <img className="logo" src={logo} alt="logo"></img>
        </div>
        <div className="tabs">
          <div className="selected">Places To Stay</div>
          <div>Experiences</div>
          <div>Online Experiences</div>
        </div>
        <div className="lrContainers">
          <ConnectButton />
        </div>
      </div>
      <div className="tabContent">
        <div className="searchFields">
          <div className="inputs">
            Location
            <Select
              defaultOptionIndex={0}
              onChange={(data) => setDestination(data.label)}
              options={[
                {
                  id: "ny",
                  label: "New York",
                },
                {
                  id: "lon",
                  label: "London",
                },
                {
                  id: "db",
                  label: "Dubai",
                },
                {
                  id: "la",
                  label: "Los Angeles",
                },
              ]}
            />
          </div>
          <div className="vl" />
          <div className="inputs">
            Check In
            <DatePicker
              id="CheckIn"
              onChange={(event) => setCheckIn(event.date)}
            />
          </div>
          <div className="vl" />
          <div className="inputs">
            Check Out
            <DatePicker
              id="CheckOut"
              onChange={(event) => setCheckOut(event.date)}
            />
          </div>
          <div className="vl" />
          <div className="inputs">
            Guests
            <Input
              value={2}
              name="AddGuests"
              type="number"
              onChange={(event) => setGuests(Number(event.target.value))}
            />
          </div>
          <Link to={"/rentals"} state={{
            destination: destination,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests
          }}>
          <div className="searchButton">
            <Icon fill="#ffffff" size={24} svg="search" />
          </div>
          </Link>
        </div>
      </div>
      <div className="randomLocation">
        <div className="title">Feeling Adventurous</div>
        <div className="text">
          Let us decide and discover new places to stay, live, work or just
          relax.
        </div>
        <Button
          text="Explore A Location"
          onClick={() => console.log(checkOut)}
        />
      </div>
      <div className="randomLocation">
        <div className="title">Add Rental</div>
        <div className="text">Rent Your Place</div>
        <form>
          <label className="label">Name:</label>
          <input className="input" id="rentalName" type="text" onChange={handleChange} required></input><br/>
          <label className="label">City:</label>
          <input className="input" id="rentalCity" type="text" onChange={handleChange} required></input><br/>
          <label className="label">Lat:</label>
          <input className="input" id="rentalLat" type="text" onChange={handleChange} required></input><br/>
          <label className="label">Long:</label>
          <input className="input" id="rentalLong" type="text" onChange={handleChange} required></input><br/>
          <label className="label">1st desc:</label>
          <input className="input" id="rental1Desc" type="text" onChange={handleChange} required></input><br/>
          <label className="label">2nd desc:</label>
          <input className="input" id="rental2Desc" type="text" onChange={handleChange}></input><br/>
          <label className="label">imgUrl:</label>
          <input className="input" id="rentalImgUrl" type="text" onChange={handleChange}></input><br/>
          <label className="label">Max Guests:</label>
          <input className="input" id="rentalMaxGuests" type="text" onChange={handleChange} required></input><br/>
          <label className="label">Price/Day in wei:</label>
          <input className="input" id="rentalPrice" type="text" onChange={handleChange} required></input><br/>


          <Button onClick={() => {
            var name = document.getElementById("rentalName").value;
            var city = document.getElementById("rentalCity").value;
            var lat = document.getElementById("rentalLat").value;
            var long = document.getElementById("rentalLong").value;
            var firstDesc = document.getElementById("rental1Desc").value;
            var secondDesc = document.getElementById("rental2Desc").value;
            var imgUrl = document.getElementById("rentalImgUrl").value;
            var maxGuests = document.getElementById("rentalMaxGuests").value;
            var price = document.getElementById("rentalPrice").value;
            if(account) {
              addRental(
                name,
                city,
                lat,
                long,
                firstDesc,
                secondDesc,
                imgUrl,
                maxGuests,
                price
            )} else {
              handleNoAccount()
            }
          }}
          text="Submit your place">
          </Button>
        </form>
      </div>
      <div className="randomLocation">
          <div className="title">Remove your rental</div>
          <div className="text">Remove your rental by using rental ID. Only works if you are the renter</div>
          <div>
            <label className="label">Rental ID:</label>
            <input id="rentalId" type="text"></input>
            <Button onClick={() => {
              if(account){
                removeRental(document.getElementById("rentalId").value)
              }else{
                handleNoAccount();
              }
            }} text="Remove Rental"></Button>
          </div>
      </div>
      
    </>
  );
};

export default Home;
