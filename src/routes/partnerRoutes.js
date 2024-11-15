const express = require('express');
const router = express.Router();
const multer = require('multer');
const partnerController = require('../controllers/partnerController');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Uploads folder created.');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save uploads in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  },
});

// File upload handler
const upload = multer({ storage });

/**
 * @swagger
 * /partners:
 *   post:
 *     summary: Add a new partner
 *     tags: [Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rhythm Energy"
 *               description:
 *                 type: string
 *                 example: "Energy provider"
 *     responses:
 *       201:
 *         description: Partner added successfully
 */
router.post('/', partnerController.createPartner);

/**
 * @swagger
 * /partners:
 *   get:
 *     summary: Get all partners
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: List of all partners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Rhythm Energy"
 *                   description:
 *                     type: string
 *                     example: "Energy provider"
 */
router.get('/', partnerController.getAllPartners);

/**
 * @swagger
 * /partners/{id}:
 *   get:
 *     summary: Get partner by ID with service offers (if applicable)
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the partner to retrieve
 *         example: 1
 *     responses:
 *       200:
 *         description: Partner details with service offers (if available)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 partner:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Rhythm Energy"
 *                     description:
 *                       type: string
 *                       example: "Energy provider"
 *                 serviceOffers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       uuid:
 *                         type: string
 *                         example: "abc123-uuid"
 *                       title:
 *                         type: string
 *                         example: "12-Month Plan"
 *                       term_months:
 *                         type: integer
 *                         example: 12
 *                       rhythm_kwh_rate:
 *                         type: number
 *                         example: 0.11
 *                       price_1000_kwh:
 *                         type: number
 *                         example: 110.00
 *                       renewable_energy:
 *                         type: boolean
 *                         example: true
 *                       description_en:
 *                         type: string
 *                         example: "Affordable renewable energy plan."
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', partnerController.getPartnerWithOffers);

/**
 * @swagger
 * /partners/{id}:
 *   patch:
 *     summary: Update partner details including file uploads
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the partner to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Logo file for the partner
 *               marketplace_cover:
 *                 type: string
 *                 format: binary
 *                 description: Marketplace cover image file
 *               company_cover:
 *                 type: string
 *                 format: binary
 *                 description: Company cover image file
 *               about:
 *                 type: string
 *                 description: About information for the partner
 *               important_information:
 *                 type: string
 *                 description: Important information about the partner
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *       404:
 *         description: Partner not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'marketplace_cover', maxCount: 1 },
  { name: 'company_cover', maxCount: 1 },
]), partnerController.updatePartner);

module.exports = router;
