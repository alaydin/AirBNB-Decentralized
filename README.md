# Airbnb-Decentral
Based on Moralis Youtube tutorials

Added:
 - Added functionality to prevent users getting "already booked" error when there is another booking for the day(s) but full capacity is not reached.
   - Ex: A rental with capacity of 3 guests is booked for a specific day for the first time for 2 guests. Even though the rental can host 1 other guest the original code prevents it and reverts with "already booked" error.
 - Any user can now add rentals from "Home page".
 - Users can remove rentals with rental id. Only the renter or smart contract owner can do that.

Potential Improvements:
 - KYC system can be implemented to improve security and usability.
 - Better UI.
