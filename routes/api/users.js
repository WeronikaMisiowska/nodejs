require("dotenv").config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const auth = require('../../middlewares/auth');
const { validateUser } = require('../../validation/userValidation');
const gravatar = require('gravatar');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const Jimp = require('jimp');
const upload = require('../../middlewares/upload');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

router.patch('/avatars', auth, upload.single('avatar'), async (req, res) => {
  try {

    const { path: tempPath, originalname } = req.file;
    const { _id } = req.user;

    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);    }

    const avatarName = `${_id}_${originalname}`;
    const avatarPath = path.join(__dirname, '../../public/avatars', avatarName);
    const image = await Jimp.read(tempPath);

    await image.resize(250, 250).writeAsync(avatarPath);

    await fsPromises.unlink(tempPath);

    const avatarURL = `/avatars/${avatarName}`;
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({ avatarURL });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email, { s: '250', d: 'retro' }, true);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        username: newUser.username,
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = validateUser(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });

    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/logout', auth, async (req, res) => {
  try {
    const user = req.user;

    user.token = null;
    await user.save();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/current', auth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
