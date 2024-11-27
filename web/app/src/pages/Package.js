import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import config from "../config";
import Modal from "../components/Modal";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaStore, FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { fetchThailandData, getDistricts, getSubDistricts, getPostalCode } from '../utils/Thailand';

function Package() {
    const [packages, setPackages] = useState([]);
    const [yourPackage, setYourPackage] = useState({});
    const [name, setname] = useState('');
    const [phone, setPhone] = useState('');
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [subDistrict, setSubDistrict] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);
    const [thailandData, setThailandData] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        loadThailandData();
    }, []);

    const fetchData = useCallback(async () => {
        try {
            axios.get(config.api_path + '/package/list').then(res => {
                setPackages(res.data.results);
            }).catch(err => {
                throw err.response.data;
            });
        } catch (e) {
            console.log(e.message);
        }
    }, []);

    const loadThailandData = async () => {
        const data = await fetchThailandData();
        setThailandData(data);
        setProvinces(data.map(p => p.name_th));
    };

    const handleProvinceChange = (e) => {
        const selectedProvince = e.target.value;
        setProvince(selectedProvince);
        setDistrict('');
        setSubDistrict('');
        
        const districtsList = getDistricts(thailandData, selectedProvince);
        setDistricts(districtsList.map(d => d.name_th));
        setSubDistricts([]);
    };

    const handleDistrictChange = (e) => {
        const selectedDistrict = e.target.value;
        setDistrict(selectedDistrict);
        setSubDistrict('');
        
        const subDistrictsList = getSubDistricts(thailandData, province, selectedDistrict);
        setSubDistricts(subDistrictsList.map(sd => sd.name_th));
    };

    const handleSubDistrictChange = (e) => {
        const selectedSubDistrict = e.target.value;
        setSubDistrict(selectedSubDistrict);
        
        // Auto-fill postal code but allow editing
        const suggestedPostalCode = getPostalCode(thailandData, province, district, selectedSubDistrict);
        setPostalCode(suggestedPostalCode);
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 10) {
            setPhone(value);
        }
    };

    const validatePassword = (password) => {
        const hasNumber = /\d/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+|~\-=`{}[\]:";'<>?,./]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!isLongEnough) return { isValid: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัว' };
        if (!hasNumber) return { isValid: false, message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
        if (!hasUpperCase || !hasLowerCase) return { isValid: false, message: 'รหัสผ่านต้องมีตัวอักษร a-Z ตัวเล็กและตัวใหญ่อย่างน้อย 1 ตัว' };
        if (!hasSpecialChar) return { isValid: false, message: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว เช่น !@#$%^&*()_+' };

        return { isValid: true, message: '' };
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPass(newPassword);
        setPasswordMatch(newPassword === confirmPass);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPass = e.target.value;
        setConfirmPass(newConfirmPass);
        setPasswordMatch(pass === newConfirmPass);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handlePostalCodeChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 5) { // Thai postal code is 5 digits
            setPostalCode(value);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกอีเมลให้ถูกต้อง',
                icon: 'error'
            });
            return;
        }

        if (phone.length !== 10) {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก',
                icon: 'error'
            });
            return;
        }

        const passwordValidation = validatePassword(pass);
        if (!passwordValidation.isValid) {
            Swal.fire({
                title: 'Error',
                text: passwordValidation.message,
                icon: 'error'
            });
            return;
        }

        if (pass !== confirmPass) {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
                icon: 'error'
            });
            return;
        }

        try {
            handleConfirmation.call(this);
        } catch (e) {
            Swal.fire({
                title: 'Error',
                text: e.message,
                icon: 'error'
            });
        }
    };

    const handleConfirmation = function() {
        Swal.fire({
            title: 'ยืนยันการสมัคร',
            text: 'โปรดยืนยันการสมัครใช้บริการ package ของเรา',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        }).then(res => {
            if (res.isConfirmed) {
                const payload = {
                    packageId: 1, // Set packageId to 1 automatically
                    email: email,
                    name: name,
                    phone: phone, 
                    password: pass,
                    firstName: firstName,
                    lastName: lastName,
                    address: {
                        fullAddress: address,
                        country: 'ไทย',
                        province: province,
                        district: district,
                        subDistrict: subDistrict,
                        postalCode: postalCode
                    },
                    status: 'active'
                };

                axios.post(config.api_path + '/member/register', payload)
                    .then(res => {
                        if (res.data.message === 'success') {
                            Swal.fire({
                                title: 'บันทึกข้อมูล',
                                text: 'บันทึกข้อมูลการสมัครเรียบร้อยแล้ว',
                                icon: 'success',
                                timer: 2000
                            });
                            navigate('/');
                        }
                    })
                    .catch(err => {
                        Swal.fire({
                            title: 'Error',
                            text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันท���กข้อมูล',
                            icon: 'error'
                        });
                    });
            }
        });
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg rounded-3 border-0">
                <div className="card-body p-4">
                    <h2 className="text-center mb-4 text-primary">สมัครสมาชิก</h2>
                    <form onSubmit={handleRegister} className="row g-4">
                        {/* Basic Information Section */}
                        <div className="col-12">
                            <h5 className="text-secondary mb-3">ข้อมูลพื้นฐาน</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaEnvelope /></span>
                                        <input type="email" className="form-control" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaPhone /></span>
                                        <input type="tel" 
                                            className="form-control" 
                                            placeholder="เบอร์โทรศัพท์" 
                                            value={phone} 
                                            onChange={handlePhoneChange}
                                            required />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaStore /></span>
                                        <input type="text" className="form-control" placeholder="ชื่อร้าน" value={name} onChange={(e) => setname(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="col-12">
                            <h5 className="text-secondary mb-3">รหัสผ่าน</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaLock /></span>
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            className="form-control" 
                                            placeholder="รหัสผ่าน (8+ ตัว, A-Z 1-2 ตัว, อักขระพิเศษเช่น !@#$%^&*)" 
                                            value={pass} 
                                            onChange={handlePasswordChange}
                                            required 
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaLock /></span>
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={`form-control ${confirmPass && !passwordMatch ? 'is-invalid' : ''}`}
                                            placeholder="ยืนยันรหัสผ่าน" 
                                            value={confirmPass} 
                                            onChange={handleConfirmPasswordChange}
                                            required 
                                        />
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary" 
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {confirmPass && !passwordMatch && (
                                        <div className="invalid-feedback d-block">
                                            รหัสผ่านไม่ตรงกัน
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="col-12">
                            <h5 className="text-secondary mb-3">ข้อมูลส่วนตัว</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaUser /></span>
                                        <input type="text" className="form-control" placeholder="ชื่อ" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaUser /></span>
                                        <input type="text" className="form-control" placeholder="นามสกุล" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="col-12">
                            <h5 className="text-secondary mb-3">ที่อยู่</h5>
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light"><FaMapMarkerAlt /></span>
                                        <textarea className="form-control" placeholder="ที่อยู่" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <input type="text" className="form-control bg-light" value="ไทย" disabled />
                                </div>
                                <div className="col-md-6">
                                    <select className="form-select" value={province} onChange={handleProvinceChange} required>
                                        <option value="">เลือกจังหวัด</option>
                                        {provinces.map((p, index) => (
                                            <option key={index} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <select className="form-select" value={district} onChange={handleDistrictChange} required>
                                        <option value="">เลือกอำเภอ/เขต</option>
                                        {districts.map((d, index) => (
                                            <option key={index} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <select className="form-select" value={subDistrict} onChange={handleSubDistrictChange} required>
                                        <option value="">เลือกตำบล/แขวง</option>
                                        {subDistricts.map((sd, index) => (
                                            <option key={index} value={sd}>{sd}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <input type="text" 
                                        className="form-control" 
                                        placeholder="รหัสไปรษณีย์" 
                                        value={postalCode} 
                                        onChange={handlePostalCodeChange}
                                        maxLength="5"
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-12 text-center mt-4">
                            <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill">
                                ยืนยันการสมัคร
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Package;
