// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract airbnb {

    address public owner;
    uint256 private counter;

    constructor() {
        counter = 0;
        owner = msg.sender;
     }

    struct rentalInfo {
        string name;
        string city;
        string lat;
        string long;
        string unoDescription;
        string dosDescription;
        string imgUrl;
        uint256 maxGuests;
        uint256 availableGuests;
        uint256 pricePerDay;
        uint256 id;
        address renter;
        mapping(string => uint256) dateToBooked;
        string[] datesBooked;
    }

    event rentalCreated (
        string name,
        string city,
        string lat,
        string long,
        string unoDescription,
        string dosDescription,
        string imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay,
        uint256 id,
        address renter
    );

    event newDatesBooked (
        string[] datesBooked,
        uint256 id,
        address booker,
        string city,
        string imgUrl 
    );

    mapping(uint256 => rentalInfo) rentals;
    uint256[] public rentalIds;


    function addRentals(
        string memory name,
        string memory city,
        string memory lat,
        string memory long,
        string memory unoDescription,
        string memory dosDescription,
        string memory imgUrl,
        uint256 maxGuests,
        uint256 pricePerDay
    ) public {
        rentalInfo storage newRental = rentals[counter];
        newRental.name = name;
        newRental.city = city;
        newRental.lat = lat;
        newRental.long = long;
        newRental.unoDescription = unoDescription;
        newRental.dosDescription = dosDescription;
        newRental.imgUrl = imgUrl;
        newRental.maxGuests = maxGuests;
        newRental.pricePerDay = pricePerDay;
        newRental.id = counter;
        newRental.renter = msg.sender;
        rentalIds.push(counter);
        emit rentalCreated(
            name, 
            city, 
            lat, 
            long, 
            unoDescription, 
            dosDescription, 
            imgUrl, 
            maxGuests,
            pricePerDay,
            counter,
            msg.sender
            );
        counter++;
    }

    function checkBookings(uint256 id, string[] memory newBookings, uint256 guests) public view returns (bool){
        
        for (uint i = 0; i < newBookings.length; i++) {
            if(rentals[id].maxGuests < rentals[id].dateToBooked[newBookings[i]] + guests) {
                return false;
            }
        }
        return true;
    }

    function addDatesBooked(uint256 id, string[] memory newBookings, uint256 guests) public payable {
        
        require(id < counter, "No such Rental");
        require(checkBookings(id, newBookings, guests), "Already Booked For Requested Date");
        require(msg.value == (rentals[id].pricePerDay * newBookings.length * guests) , "Please submit the asking price in order to complete the purchase");

        for (uint i = 0; i < newBookings.length; i++) {
            rentals[id].dateToBooked[newBookings[i]] += guests;
            rentals[id].datesBooked.push(newBookings[i]);
        }

        payable(rentals[id].renter).transfer(msg.value * 9 / 10);
        payable(owner).transfer(msg.value * 1 / 10);
        emit newDatesBooked(newBookings, id, msg.sender, rentals[id].city,  rentals[id].imgUrl);
    }

    function removeRental(uint256 id) public {
        require(msg.sender == rentals[id].renter || msg.sender == owner, "you don't have permission to delete this rental");
        require(id <= counter && counter >= 0, "invalid rental id");
        for(uint i=0; i < rentals[id].datesBooked.length; i++) {
            delete rentals[id].dateToBooked[rentals[id].datesBooked[i]];
        }
        delete rentals[id];
        counter--;
    }

    function getRental(uint256 id) public view returns (string memory, uint256){
        require(id < counter, "No such Rental");

        rentalInfo storage s = rentals[id];
        return (s.name,s.pricePerDay);
    }
}