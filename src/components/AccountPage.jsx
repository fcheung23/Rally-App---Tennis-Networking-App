import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './AccountPage.css';

const AccountPage = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [social, setSocial] = useState('');
  const [socialType, setSocialType] = useState('none');
  const [bio, setBio] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [rating, setRating] = useState(''); 
  const [ratingType, setRatingType] = useState('none'); 
  const [zipcode, setZipcode] = useState('');
  const [error, setError] = useState(null);
  const [ratingError, setRatingError] = useState(null); 
  const [profileImage, setProfileImage] = useState(null); 
  const [imageUrl, setImageUrl] = useState(''); 
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Fetch user data
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || '');
          setEmail(data.email || '');
          setSocialType(data.socialType || '');
          setSocial(data.social || '');
          setBio(data.bio || '');
          setSkillLevel(data.skillLevel || '');
          setRating(data.rating || ''); 
          setRatingType(data.ratingType || 'none');
          setZipcode(data.zipcode || '');
          setImageUrl(data.imageUrl || ''); 
        }
      };
      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle profile picture update by user and updates state
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]); 
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        // Validate the user's rating input is within the respective standard ranges
        if (ratingType !== 'none') {
          const valid = validateRating(ratingType, rating); 
          if (!valid) {
            setRatingError(`Please enter a valid ${ratingType.toUpperCase()} rating.`); 
            return;
          }
        }
        // Handles profile picture update to Firebase and retrieves url
        let imageURL = imageUrl;
        if (profileImage) {
          const imageRef = ref(storage, `profileImages/${user.uid}`); 
          await uploadBytes(imageRef, profileImage); 
          imageURL = await getDownloadURL(imageRef); 
        }
        // Update data
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          firstName, 
          email,
          socialType,
          social,
          bio,
          skillLevel,
          ratingType, 
          rating, 
          zipcode, 
          imageUrl: imageURL 
        });
        navigate('/search');
      } catch (e) {
        setError(e.message);
      }
    }
  };

  // Validates user inputs ratings within conventional values (ex: UTR has a min of 1 and a max of 16.5)
  const validateRating = (type, value) => { 
    const numValue = parseFloat(value);
    switch (type) {
      case 'utr':
        return numValue >= 1 && numValue <= 16.5;
      case 'ntrp':
        return numValue >= 1 && numValue <= 7;
      default:
        return true;
    }
  };

  // Displays rating input placeholder depending on rating type selected
  const getRatingPlaceholder = () => { 
    switch (ratingType) {
      case 'utr':
        return 'Enter UTR Rating';
      case 'ntrp':
        return 'Enter NTRP Rating';
      default:
        return 'Select Rating Type First'; 
    }
  };

  // Displays social tag input placeholder depending on social type selected  
  const getSocialPlaceholder = () => {
    switch (socialType) {
      case 'insta':
        return 'Instagram Username (no @)';
      case 'fb':
        return 'FaceBook Username (no @)';
      case 'twitter':
        return 'Twitter Username (no @)';
      default:
        return 'Select Social Type First';
    }
  };
  return (
    <form className="account-form" onSubmit={handleUpdate}>
      <h1>Profile</h1>
      {error && <p className="error-message">{error}</p>}
      {ratingError && <p className="error-message">{ratingError}</p>} 
      <div className="profile-image-section">
        <img 
          src={imageUrl ? imageUrl : "/img/default-pic.jpg"} 
          alt="Profile" 
          className="profile-image" 
        />
        <input className="choose-file" type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      <input 
        type="text" 
        placeholder="First Name" 
        value={firstName} 
        onChange={(e) => setFirstName(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Write a Bio! (ex: availability and interests)" 
        value={bio} 
        onChange={(e) => setBio(e.target.value)} 
      />
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />

      <select 
        value={socialType} 
        onChange={(e) => setSocialType(e.target.value)}
      >
        <option value="none">Add a Social!</option>
        <option value="insta">Instagram</option>
        <option value="fb">FaceBook</option>
        <option value="twitter">Twitter</option>
      </select>

      <input 
        type="text" 
        placeholder={getSocialPlaceholder()}
        value={social} 
        onChange={(e) => setSocial(e.target.value)} 
        disabled={socialType === 'none'}
      />
      <select 
        value={skillLevel} 
        onChange={(e) => setSkillLevel(e.target.value)}
      >
        <option value="">Select Skill Level</option>
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>
     
      <select 
        value={ratingType} 
        onChange={(e) => setRatingType(e.target.value)}
      >
        <option value="none">Add a Rating! (optional)</option>
        <option value="utr">UTR</option>
        <option value="ntrp">NTRP</option>
      </select>

      <input 
        type="number" 
        placeholder={getRatingPlaceholder()}
        value={rating} 
        onChange={(e) => setRating(e.target.value)} 
        min="0"
        step="0.1"
        disabled={ratingType === 'none'}
      />
      <input 
        type="text" 
        placeholder="Zipcode" 
        value={zipcode} 
        onChange={(e) => setZipcode(e.target.value)} 
      />
      <button type="submit">Update</button>
    </form>
  );
};

export default AccountPage;
