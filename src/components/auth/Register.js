import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Register.css';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    otp: '',
    password: '',
    confirmPassword: '',
    userType: '',
    schoolId: '',
    schoolName: '',
    pinCode: '',
    city: '',
    state: '',
    address: '',
    employeeId: '',
    seRole: '',
  });

  const [errors, setErrors] = useState({});
  const [seEmployeeIds, setSeEmployeeIds] = useState([]);
  const [schoolNames, setSchoolNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Validation regex patterns
  const regex = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mobile: /^[6-9]\d{9}$/,
    pinCode: /^\d{6}$/,
    otp: /^\d{6}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  };

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return regex.name.test(value) ? '' : 'Must be 2-50 characters, letters only';
      case 'email':
        return regex.email.test(value) ? '' : 'Invalid email format';
      case 'mobile':
        return regex.mobile.test(value) ? '' : 'Must be a valid 10-digit mobile number';
      case 'otp':
        return regex.otp.test(value) ? '' : 'Must be a 6-digit number';
      case 'password':
        return regex.password.test(value)
          ? ''
          : 'Must be 8+ characters with uppercase, lowercase, number, and special character';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      case 'pinCode':
        return regex.pinCode.test(value) ? '' : 'Must be a 6-digit pin code';
      case 'address':
        return value.length >= 5 ? '' : 'Address must be at least 5 characters';
      case 'schoolName':
        return value.length >= 3 ? '' : 'School name must be at least 3 characters';
      case 'userType':
        return value ? '' : 'Please select a user type';
      case 'schoolId':
        return value ? '' : 'Please select a school';
      case 'employeeId':
        return value ? '' : 'Please enter/select an employee ID';
      case 'seRole':
        return value ? '' : 'Please select an SE role';
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        key === 'city' ||
        key === 'state' ||
        (key === 'schoolId' && formData.userType !== 'student') ||
        (key === 'schoolName' && formData.userType !== 'school') ||
        (key === 'pinCode' && formData.userType !== 'school') ||
        (key === 'address' && formData.userType !== 'school') ||
        (key === 'employeeId' && !['school', 'se'].includes(formData.userType)) ||
        (key === 'seRole' && formData.userType !== 'se')
      ) {
        return;
      }
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch school names for students
  useEffect(() => {
    if (formData.userType === 'student') {
      fetchSchoolNames();
    }
  }, [formData.userType]);

  const fetchSchoolNames = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/schools');
      const data = await response.json();
      setSchoolNames(data);
    } catch (error) {
      console.error('Error fetching school names:', error);
    }
  };

  // Fetch SE employee IDs for school users
  useEffect(() => {
    if (formData.userType === 'school') {
      fetchSeEmployeeIds();
    }
  }, [formData.userType]);

  const fetchSeEmployeeIds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/se-employees');
      const data = await response.json();
      setSeEmployeeIds(data);
    } catch (error) {
      console.error('Error fetching SE Employee IDs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate field on change
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleUserTypeChange = (e) => {
    setFormData({ ...formData, userType: e.target.value, seRole: '', schoolId: '', employeeId: '' });
    setErrors({});
  };

  const fetchCityState = async () => {
    if (regex.pinCode.test(formData.pinCode)) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pinCode}`);
        const data = await response.json();
        if (data[0].Status === 'Success') {
          const { District, State } = data[0].PostOffice[0];
          setFormData({ ...formData, city: District, state: State });
          setErrors({ ...errors, pinCode: '' });
        } else {
          setErrors({ ...errors, pinCode: 'Invalid Pin Code' });
        }
      } catch (error) {
        console.error('Error fetching city and state:', error);
        setErrors({ ...errors, pinCode: 'Failed to fetch location' });
      }
    }
  };

  const handleSendOtp = async () => {
    if (!regex.email.test(formData.email)) {
      setErrors({ ...errors, email: 'Please enter a valid email' });
      return;
    }
    try {
      setLoading(true);
      setOtpError('');
      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setOtpSent(true);
        alert('OTP sent to your email!');
      } else {
        const data = await response.json();
        setOtpError(data.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setOtpError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!regex.otp.test(formData.otp)) {
      setOtpError('OTP must be a 6-digit number');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      if (response.ok) {
        alert('OTP verified successfully!');
        setOtpError('');
      } else {
        const data = await response.json();
        setOtpError(data.message || 'Invalid OTP.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('An error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix the errors in the form.');
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Registration successful!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          otp: '',
          password: '',
          confirmPassword: '',
          userType: '',
          schoolId: '',
          schoolName: '',
          pinCode: '',
          city: '',
          state: '',
          address: '',
          employeeId: '',
          seRole: '',
        });
        navigate('/user/login');
      } else {
        alert(data.error || 'Something went wrong!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="body78133">
      <img src={logo} alt="Logo" className="logo133" />
      <form className="form-container133" onSubmit={handleSubmit}>
        <div>
          <label className="label133">First Name</label>
          <input
            type="text"
            className="input133"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}
        </div>
        <div>
          <label className="label133">Last Name</label>
          <input
            type="text"
            className="input133"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}
        </div>
        <div>
          <label className="label133">Email</label>
          <input
            type="email"
            className="input133"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
        </div>
        <div>
          <label className="label133">Mobile Number</label>
          <input
            type="text"
            className="input133"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
          {errors.mobile && <p className="error-message">{errors.mobile}</p>}
        </div>
        <div>
          <label className="label133">Enter OTP</label>
          <input
            type="text"
            className="input133"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="button133"
            onClick={handleSendOtp}
            disabled={loading || !formData.email || errors.email}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
          <button
            type="button"
            className="button133"
            onClick={handleVerifyOtp}
            disabled={!otpSent || !formData.otp}
          >
            Verify OTP
          </button>
          {(otpError || errors.otp) && <p className="error-message">{otpError || errors.otp}</p>}
        </div>
        <div>
          <label className="label133">Password</label>
          <input
            type="password"
            name="password"
            className="input133"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>
        <div>
          <label className="label133">Confirm Password</label>
          <input
            type="password"
            className="input133"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className="label133">User Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="userType"
                value="student"
                onChange={handleUserTypeChange}
                required
              />{' '}
              Student
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="school"
                onChange={handleUserTypeChange}
              />{' '}
              School
            </label>
            <label>
              <input
                type="radio"
                name="userType"
                value="se"
                onChange={handleUserTypeChange}
              />{' '}
              SE
            </label>
          </div>
          {errors.userType && <p className="error-message">{errors.userType}</p>}
        </div>

        {/* Conditional Fields */}
        {formData.userType === 'student' && (
          <div>
            <label className="label133">School Name</label>
            <select
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              required
            >
              <option value="">Select School</option>
              {schoolNames.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.school_name}
                </option>
              ))}
            </select>
            {errors.schoolId && <p className="error-message">{errors.schoolId}</p>}
          </div>
        )}
        {formData.userType === 'se' && (
          <>
            <div>
              <label className="label133">Enter SE Employee ID</label>
              <input
                type="text"
                className="input133"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
              {errors.employeeId && <p className="error-message">{errors.employeeId}</p>}
            </div>
            <div>
              <label className="label133">SE Role</label>
              <select
                name="seRole"
                value={formData.seRole}
                onChange={handleChange}
                required
              >
                <option value="">Select SE Role</option>
                <option value="Calling SE">Calling SE</option>
                <option value="Field SE">Field SE</option>
              </select>
              {errors.seRole && <p className="error-message">{errors.seRole}</p>}
            </div>
          </>
        )}
        {formData.userType === 'school' && (
          <>
            <div>
              <label className="label133">School Name</label>
              <input
                type="text"
                className="input133"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                required
              />
              {errors.schoolName && <p className="error-message">{errors.schoolName}</p>}
            </div>
            <div>
              <label className="label133">Pin Code</label>
              <input
                type="text"
                className="input133"
                name="pinCode"
                value={formData.pinCode}
                onChange={handleChange}
                onBlur={fetchCityState}
                required
              />
              {errors.pinCode && <p className="error-message">{errors.pinCode}</p>}
            </div>
            <div>
              <label className="label133">City</label>
              <input
                type="text"
                className="input133"
                name="city"
                value={formData.city}
                readOnly
              />
            </div>
            <div>
              <label className="label133">State</label>
              <input
                type="text"
                className="input133"
                name="state"
                value={formData.state}
                readOnly
              />
            </div>
            <div>
              <label className="label133">Address</label>
              <input
                type="text"
                className="input133"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
              {errors.address && <p className="error-message">{errors.address}</p>}
            </div>
            <div>
              <label className="label133">Select SE Employee ID</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              >
                <option value="">Select Employee ID</option>
                {seEmployeeIds.map((id, index) => (
                  <option key={index} value={id.employee_id}>
                    {id.employee_id}
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="error-message">{errors.employeeId}</p>}
            </div>
          </>
        )}

        <div>
          <label className="check112">
            <input type="checkbox" className="check122" required /> I agree to the Terms
            and Conditions.
          </label>
        </div>

        <button
          className="button133"
          type="submit"
          disabled={submitLoading || Object.keys(errors).some((key) => errors[key])}
        >
          {submitLoading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;