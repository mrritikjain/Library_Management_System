import { useEffect, useState } from "react";
import axios from "axios";

const Seats = () => {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/seats/all", {
          withCredentials: true,
        });

        setSeats(res.data.seats);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSeats();
  }, []);
  return (
    <div>
      <div style={{ display: "flex", gap: "15px" }}>
        {seats.map((seat) => (
          <div
            key={seat._id}
            style={{ border: "1px solid #ccc", padding: "10px" }}
          >
            <h3>Seat Number: {seat.seatNumber}</h3>

            <p>Morning: {seat.morning.isOccupied ? "Occupied" : "Available"}</p>
            <p>Evening: {seat.evening.isOccupied ? "Occupied" : "Available"}</p>
            <p>
              Full Day: {seat.fullDay.isOccupied ? "Occupied" : "Available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Seats;
