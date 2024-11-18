import React, { useEffect, useState } from 'react';
import './lecture.css';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { server } from '../../main';
import Loading from '../../components/loading/Loading';
import toast from 'react-hot-toast';

const Lecture = ({ user }) => {
    const [lectures, setLectures] = useState([]);
    const [lecture, setLecture] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [lecLoading, setLecLoading] = useState(false);
    const [show, setShow] = useState(false); // State to toggle Add Lecture form visibility
    const [title, setTitle] = useState(''); // State to manage title input
    const [description, setDescription] = useState(''); // State to manage description input
    const [video, setVideo] = useState(null); // State to manage video file input
    const [videoPrev, setVideoPrev] = useState('');
    const [btnLoading, setBtnLoading] = useState(false); // To handle button loading state
    const params = useParams();

    // Redirect user if not admin or not subscribed to the course
    useEffect(() => {
        if (user && user.role !== 'admin' && !user.subscription?.includes(params.id)) {
            toast.error('Access Denied. Please subscribe to the course.');
            navigate('/');
        }
    }, [user, params.id, navigate]);

    // Fetch all lectures for the course
    async function fetchLectures() {
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Unauthorized. Please login.');
            navigate('/login');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLectures(data.lectures);
            setLoading(false);
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else {
                toast.error('Error fetching lectures.');
            }
            setLoading(false);
        }
    }

    // Fetch a single lecture
    async function fetchLecture(id) {
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Unauthorized. Please login.');
            navigate('/login');
            setLecLoading(false);
            return;
        }

        setLecLoading(true);

        try {
            const { data } = await axios.get(`${server}/api/lecture/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLecture(data.lecture);
            setLecLoading(false);
        } catch (error) {
            toast.error('Error fetching lecture.');
            setLecLoading(false);
        }
    }

    // Delete a lecture
    const deleteLecture = async (id) => {
        if (window.confirm("Are you sure you want to delete this lecture?")) {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Unauthorized. Please login.");
                navigate("/login");
                return;
            }

            try {
                const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                toast.success(data.message);
                fetchLectures(); // Refresh the list after deletion
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete the lecture.");
            }
        }
    };

    // Handle video file input change
    const changeVideoHandler = (e) => {
        const file = e.target.files[0];

        if (file && file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setVideoPrev(reader.result);
                setVideo(file);
            };
        } else {
            toast.error('Please upload a valid video file.');
        }
    };

    // Submit new lecture
    const submitHandler = async (e) => {
        e.preventDefault();
        setBtnLoading(true);

        if (!title || !description || !video) {
            toast.error('All fields are required.');
            setBtnLoading(false);
            return;
        }

        const myForm = new FormData();
        myForm.append('title', title);
        myForm.append('description', description);
        myForm.append('file', video);

        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Unauthorized. Please login.');
            navigate('/login');
            setBtnLoading(false);
            return;
        }

        try {
            const { data } = await axios.post(`${server}/api/course/${params.id}`, myForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(data.message);
            setBtnLoading(false);
            setShow(false);
            fetchLectures(); // Refresh the list after adding a new lecture
            setTitle('');
            setDescription('');
            setVideo(null); // Reset the video input
            setVideoPrev('');
        } catch (error) {
            toast.error(error.response?.data.message || 'Error adding lecture.');
            setBtnLoading(false);
        }
    };

    // Fetch lectures when component mounts or params.id changes
    useEffect(() => {
        fetchLectures();
    }, [params.id]);

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <div className="lecture-page">
                    <div className="left">
                        {lecLoading ? (
                            <Loading />
                        ) : (
                            <>
                                {lecture.video ? (
                                    <>
                                        <video
                                            src={`${server}/${lecture.video.replace('\\', '/')}`}
                                            width={'100%'}
                                            controls
                                            controlsList="nodownload nomoretoplayback"
                                            disablePictureInPicture
                                            disableRemotePlayback
                                            autoPlay
                                        ></video>
                                        <h1>{lecture.title}</h1>
                                        <h3>{lecture.description}</h3>
                                    </>
                                ) : (
                                    <h1>Please Select a Lecture</h1>
                                )}
                            </>
                        )}
                    </div>
                    <div className="right">
                        {user && user.role === 'admin' && (
                            <button className="common-btn" onClick={() => setShow(!show)}>
                                {show ? 'Close' : 'Add Lecture +'}
                            </button>
                        )}

                        {show && (
                            <div className="lecture-form">
                                <h2>Add Lecture</h2>
                                <form onSubmit={submitHandler}>
                                    <label htmlFor="title">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />

                                    <label htmlFor="description">Description</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />

                                    <input
                                        type="file"
                                        placeholder="Choose video"
                                        onChange={changeVideoHandler}
                                        required
                                    />

                                    {videoPrev && (
                                        <video src={videoPrev} alt="" width={300} controls />
                                    )}

                                    <button
                                        disabled={btnLoading}
                                        type="submit"
                                        className="common-btn"
                                    >
                                        {btnLoading ? 'Please Wait...' : 'Add'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {lectures.length > 0 ? (
                            lectures.map((e, i) => (
                                <div key={i}>
                                    <div
                                        onClick={() => fetchLecture(e._id)}
                                        className={`lecture-number ${
                                            lecture._id === e._id ? 'active' : ''
                                        }`}
                                    >
                                        {i + 1}. {e.title}
                                    </div>
                                    {user && user.role === 'admin' && (
                                        <button
                                            className="common-btn"
                                            style={{ background: 'red' }}
                                            onClick={() => deleteLecture(e._id)}
                                        >
                                            Delete {e.title}
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No lectures yet!</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Lecture;
