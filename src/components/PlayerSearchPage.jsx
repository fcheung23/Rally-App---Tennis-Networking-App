import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { getDistance } from 'geolib';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons'; 
import './PlayerSearchPage.css';

const PlayerSearchPage = () => {
  const [players, setPlayers] = useState([]);
  const [skillLevel, setSkillLevel] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [radius, setRadius] = useState('');
  const [userData, setUserData] = useState(null); 
  const navigate = useNavigate();

  // Fetch logged in user's data (for sidebar display)
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, []);

  // Fetch players data and sort for real-time search
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersRef = collection(db, 'users');
        let q = query(playersRef);
        // Sort for skill level match
        if (skillLevel) {
          q = query(playersRef, where('skillLevel', '==', skillLevel));
        }
        const querySnapshot = await getDocs(q);
        const playersData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            utr: data.ratingType === 'utr' ? parseFloat(data.rating) : null,
            ntrp: data.ratingType === 'ntrp' ? parseFloat(data.rating) : null,
          };
        });
        // Get locations for all players
        const locationsPromises = playersData.map(player =>
          getLatLongFromZipcode(player.zipcode).then(location => ({
            ...player,
            location
          }))
        );
        const playersWithLocations = await Promise.all(locationsPromises);
        // Filter players based on distance
        let filteredPlayers = playersWithLocations;
        if (zipcode && radius) {
          const userLocation = await getLatLongFromZipcode(zipcode);
          if (userLocation) {
            filteredPlayers = filteredPlayers.filter(player => {
              if (player.location) {
                const distance = getDistance(userLocation, player.location);
                return distance <= Number(radius) * 1609.34; // miles to meters
              }
              return false;
            });
            filteredPlayers = filteredPlayers.map(player => ({
              ...player,
              distance: Math.round(getDistance(userLocation, player.location) / 1609.34) // meters to miles
            }));
          } else {
            filteredPlayers = [];
          }
        } else {
          filteredPlayers = filteredPlayers.map(player => ({
            ...player,
            distance: '?' 
          }));
        }
        setPlayers(filteredPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    fetchPlayers();
  }, [skillLevel, zipcode, radius]);

  // Handles logout with firebase
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      console.error('Error signing out:', e);
    }
  };

  // Gets location details from zipcode
  const getLatLongFromZipcode = async (zipcode) => {
    try {
      const response = await axios.get(`https://api.zippopotam.us/us/${zipcode}`);
      const { places } = response.data;
      if (places && places.length > 0) {
        const place = places[0];
        return {
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          city: place['place name'],
          state: place['state abbreviation']
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return null;
    }
  };

  // Render appropriate social icon based on selection
  const renderSocialIcons = (socialType, socialHandle) => {
    switch (socialType) {
      case 'insta':
        return (
          <a href={`https://instagram.com/${socialHandle}`} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faInstagram} className="social-icon" />
          </a>
        );
      case 'twitter':
        return (
          <a href={`https://twitter.com/${socialHandle}`} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faTwitter} className="social-icon" />
          </a>
        );
      case 'fb':
        return (
          <a href={`https://facebook.com/${socialHandle}`} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFacebook} className="social-icon" />
          </a>
        );
      default:
        return null;
    }
  };  

  return (
    <div className="player-search-page">
      <div className="sidebar">
      <div className="profile-picture">
        <img 
          src={userData && userData.imageUrl ? userData.imageUrl : "/img/default-pic.jpg"} 
          alt="Profile" 
        />
      </div>
        <button onClick={() => navigate('/account')} className="account-button">
          Edit Profile
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      <div className="main-content">
        <h1>Player Search 🔎︎</h1>
        <div className="search-filters">
          <label>
            Skill Level:
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              className="select-field"
            >
              <option value="">Any</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>
          <label>
            Zipcode:
            <input
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="input-field"
              placeholder="Enter your zipcode"
            />
          </label>
          <label>
            Radius (miles):
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="input-field"
              placeholder="Enter search radius"
            />
          </label>
        </div>
        <div className="player-list">
          {players.map((player, index) => (
            <div key={index} className="player-item">
              <div className="player-picture">
                {player && player.imageUrl ? (
                  <img src={player.imageUrl} alt="Profile" />
                ) : (
                  <img src="\img\default-pic.jpg" alt="Default Profile Pic" /> 
                )}
              </div>
              <div className='player-details'>
                <p>
                  <strong>{player.firstName}</strong>
                  {player.socialType && player.social && renderSocialIcons(player.socialType, player.social)}
                </p>
                <p>Email: {player.email}</p>
                <p>Skill Level: {player.skillLevel}</p>
                {player.utr && <p>UTR: {player.utr}</p>}
                {player.ntrp && <p>NTRP: {player.ntrp}</p>}
                <p>Located: {player.location ? `${player.location.city}, ${player.location.state} (${player.distance} mi)` : 'Unknown location'}</p>
                <p>{player.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerSearchPage;
