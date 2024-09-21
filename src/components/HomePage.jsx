import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const user = auth.currentUser;

    // Navigate to search page if already logged in
    useEffect(() => {
        if (user) {
            navigate('/search'); 
        }
    }, [user, navigate]);

    const handleJoinNow = () => {
        navigate('/signup'); 
    };

    const handleLogin = () => {
        navigate('/login'); 
    };

    return (
        <div className="home-page">
            <div className="main-content-box">
                <div className= "left-box">
                    <img className="home-logo" src="\img\rally_up_logo.png" alt="Logo" />
                    <p className="caption">A place for tennis players to connect, find hitting 
                        <br />partners, and improve their game while sharing 
                        <br />skills, learning, and enjoying the sport together.</p>
                    <div className="user-action">
                        <button className="join-now-button" type="button" onClick={handleJoinNow}>Join now</button>
                        <button className="login-button" type="button" onClick={handleLogin}>Log in</button>
                    </div>
                </div>
                <div className= "right-box">
                    <img className="graphic" src="\img\graphic.png" alt="graphic" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
