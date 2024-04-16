import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllBookings } from "../redux/actions/bookingActions";
import { Col, Row } from "antd";
import Spinner from "../components/Spinner";
import moment from "moment";
import defaultcar from "../images/defaultcar.jpg";
import Footer from "./Footer";

function UserBookings() {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state) => state.bookingsReducer);
  const { loading } = useSelector((state) => state.alertsReducer);
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchTerm, setSearchTerm] = useState(
    localStorage.getItem("userBookingsSearchTerm") || ""
  );

  useEffect(() => {
    dispatch(getAllBookings());
  }, [searchTerm]);
  const handleSearchTermChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    localStorage.setItem("userBookingsSearchTerm", newSearchTerm);
  };
  return (
    <DefaultLayout>
      {loading && <Spinner />}
      <h3
        className="text-center"
        style={{
          color: "white",
          marginTop: "5.2rem",
        }}
      >
        {user.admin ? "All Recent Bookings" : "Your Booking History"}
      </h3>
      <input
        type="text" style={{padding: "10px", borderRadius: "10px", border: "none"}}
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchTermChange}
      />
      <Row justify="center" gutter={16}>
        <Col lg={16} sm={24} style={{ color: "darkslategray" }}>
          {bookings
            .filter((booking) => {
              if (user.admin) {
                return (
                  booking.car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  booking.user.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
              } else {
                return (
                  booking.car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  booking.user.email.toLowerCase().includes(searchTerm.toLowerCase())
                ) && booking.user && booking.user._id === user._id;
              }
            })
            .map((booking) => (
              <Row
                gutter={16}
                className="Userbooking bs1 mt-2 mb-2 text-left"
                style={{
                  backgroundColor: "#4B0082df",
                  borderRadius: "5px", color: "#fff"
                }}
                key={booking._id}
              >
                <Col lg={6} sm={24}>
                  {booking.car ? (
                    <p>
                      <b>{booking.car.name}</b>
                    </p>
                  ) : (
                    <p>
                      <b>Not Available</b>
                    </p>
                  )}
                  <p>
                    User : <b>{booking.user?.email || "No email"}</b>
                  </p>
                  <p>
                    Total Minutes : <b>{booking.totalMins}</b>
                  </p>
                  <p>
                    Driver :
                    {booking.driverRequired ? (
                      <b> Required</b>
                    ) : (
                      <b> Not Required</b>
                    )}
                  </p>
                  <p>
                    Total amount : <b>${booking.totalAmount}</b>
                  </p>
                </Col>

                <Col lg={12} sm={24}>
                  <p>
                    Transaction Id : <b>{booking.transactionId}</b>
                  </p>
                  <p>
                    User Contact :{" "}
                    <b>{booking.user?.phone || "No phone"}</b>
                  </p>
                  <p>
                    From: <b>{booking.bookedTimeSlots.from}</b>
                  </p>
                  <p>
                    To: <b>{booking.bookedTimeSlots.to}</b>
                  </p>
                  <p>
                    Date of booking:{" "}
                    <b>{moment(booking.createdAt).format("MMM DD yyyy")}</b>
                  </p>
                </Col>

                <Col lg={6} sm={24} className="text-right">
                  {booking.car ? (
                    <img
                      style={{ borderRadius: 5, objectFit: "contain" }}
                      src={booking.car.image}
                      height="140"
                      width="200"
                      className="p-2"
                      alt="Car"
                    />
                  ) : (
                    <img
                      style={{ borderRadius: 5 }}
                      src={defaultcar}
                      height="140"
                      className="p-2"
                      alt="Default Car"
                    />
                  )}
                </Col>
              </Row>
            ))}
        </Col>
      </Row>
      <Footer/>
    </DefaultLayout>
    
  );
}

export default UserBookings;
