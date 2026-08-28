import { supabase } from '../config/supabase.js';

// 1. Register User via Supabase Auth
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name, full_name } = req.body;
    const userFullName = full_name || name;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: userFullName } 
      },
    });

    if (error) {
      return res.status(450 || 400).json({ success: false, message: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Check your email for verification.',
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

// 2. Login User via Supabase Auth
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

// 3. Step 1: Request 6-Digit Password Reset OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'A 6-digit OTP code has been sent to your email address.',
    });
  } catch (err) {
    next(err);
  }
};

// 4. Step 2: Verify 6-Digit OTP Standalone
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP code with Supabase Auth recovery type
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (error || !data) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully.',
      // Pass back the temporary session token so the reset-password step can use it securely
      token: data.session.access_token 
    });
  } catch (err) {
    next(err);
  }
};

// 5. Step 3: Reset Password using the token/session from verification
export const resetPassword = async (req, res, next) => {
  try {
    // Expects the Bearer token from the verifyOtp step, or email/newPassword depending on design
    const { newPassword } = req.body;
    
    // If using the session token passed in headers from verify-otp:
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please verify OTP first.' });
    }
    const token = authHeader.split(' ')[1];

    // Set session or update user directly using the recovery token
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return res.status(400).json({ success: false, message: updateError.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};