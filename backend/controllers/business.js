const {Business} = require('../models/business')

async function createBusiness (req, res) {
    try {
        const newBusiness = new Business(req.body);
        await newBusiness.save();
        res.status(201).json(newBusiness);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function deleteBusiness (req, res) {
    try {
        const { id } = req.params;
        const business = await Business.findByIdAndDelete(id);
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.status(200).json({ message: 'Business deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function updateBusiness (req, res){
    try {
        const { id } = req.params;
        const updatedBusiness = await Business.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBusiness) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.status(200).json(updatedBusiness);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function getAllBusinesses (req, res) {
    try {
        const businesses = await Business.find().populate('hotels');
        res.status(200).json(businesses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

async function getBusinessById (req, res) {
    try {
        const { id } = req.params;
        const business = await Business.findById(id).populate('hotels');
        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.status(200).json(business);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createBusiness,
    deleteBusiness,
    updateBusiness,
    getAllBusinesses,
    getBusinessById
  }