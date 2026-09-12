import { supabase } from '../config/supabase.js';

// 1. Register User via Supabase Auth
export const registerUser = async (req, res) => {
  try {
    const { email, password, name, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const userFullName = full_name || name || '';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: userFullName } 
      },
    });

    // Handle Supabase auth errors (weak password, invalid email format, etc.)
    if (error) {
      console.error('Supabase SignUp Error:', error);
      return res.status(error.status || 400).json({ success: false, message: error.message });
    }

    // Handle duplicate email detection when email confirmation/enumeration protection is enabled
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email for verification.',
      user: data.user,
    });
  } catch (err) {
    console.error('Registration Catch Block Exception:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected internal server error occurred.',
    });
  }
};

// 2. Login User via Supabase Auth
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', error);
      return res.status(error.status || 400).json({ success: false, message: error.message });
    }

    if (!data?.session) {
      return res.status(400).json({ 
        success: false, 
        message: 'Login failed. Please verify your email before logging in.' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    console.error('Login Catch Block Exception:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected internal server error occurred.',
    });
  }
};

// 3. Step 1: Request 6-Digit Password Reset OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      console.error('Supabase Forgot Password Error:', error);
      return res.status(error.status || 400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'A 6-digit OTP code has been sent to your email address.',
    });
  } catch (err) {
    console.error('Forgot Password Catch Block Exception:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected internal server error occurred.',
    });
  }
};

// 4. Step 2: Verify 6-Digit OTP Standalone
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (error || !data?.session) {
      console.error('Supabase OTP Verification Error:', error);
      return res.status(400).json({ 
        success: false, 
        message: error?.message || 'Invalid or expired OTP code.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully.',
      token: data.session.access_token 
    });
  } catch (err) {
    console.error('Verify OTP Catch Block Exception:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected internal server error occurred.',
    });
  }
};

// 5. Step 3: Reset Password using the token/session from verification
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required.' });
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please verify OTP first.' });
    }
    const token = authHeader.split(' ')[1];

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    if (sessionError) {
      console.error('Supabase Set Session Error:', sessionError);
      return res.status(401).json({ success: false, message: 'Invalid or expired reset session.' });
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Supabase Update User Error:', updateError);
      return res.status(updateError.status || 400).json({ success: false, message: updateError.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (err) {
    console.error('Reset Password Catch Block Exception:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected internal server error occurred.',
    });
  }
};