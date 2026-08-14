import { supabase } from '../config/supabase.js';

// 1. Register User via Supabase Auth
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }, // Stores additional user metadata
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({
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

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token, // JWT passed to frontend
      user: data.user,
    });
  } catch (err) {
    next(err);
  }
};

// 3. Request 6-Digit Password Reset OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(200).json({
      success: true,
      message: 'A 6-digit OTP code has been sent to your email address.',
    });
  } catch (err) {
    next(err);
  }
};

// 4. Verify 6-Digit OTP and Update Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP code with Supabase
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (verifyError) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    // Update password for verified session
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) return res.status(400).json({ success: false, message: updateError.message });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (err) {
    next(err);
  }
};