import React, { useEffect, useState } from 'react';
import "./CourseDescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from '../../context/CourseContext';
import { server } from "../../main";
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserData } from '../../context/UserContext';
import Loading from '../../components/loading/Loading';

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const { fetchUser } = UserData();
  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, [params.id]);

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to be logged in to make a purchase.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: {order},
      } = await axios.
      post(
        `${server}/api/course/checkout/${params.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const options = {
        key: "rzp_test_YHxwlqVAbqXBkE", // Razorpay Key
        amount: order.id, // Amount in currency subunits. Default currency is INR.
        currency: "INR",
        name: "E learning",
        description: "Learn with us",
        order_id: order.id, // Pass the actual Order ID

        handler: async function (response) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

          try {
            const { data } = await axios.post(
              `${server}/api/verification/${params.id}`,
              {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            await fetchUser();
            await fetchCourses();
            await fetchMyCourse();
            toast.success(data.message);
            setLoading(false);
            navigate(`/payment-success/${razorpay_payment_id}`);
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification failed.");
            setLoading(false);
          }
        },

        theme: {
          color: "#8a4baf",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Failed to fetch order details.");
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={course?.image ? `${server}/${course.image}` : '/default-image.png'}
                  alt="course"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>Instructor: {course.createdBy}</p>
                  <p>Duration: {course.duration}</p>
                </div>
              </div>
              <p>Let's get started with the course at ₹{course.price}</p>

              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button onClick={checkoutHandler} className="common-btn">
                  Buy Now
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;
