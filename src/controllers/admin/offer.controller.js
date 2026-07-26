import offerService from '../../services/admin/index.js';

class OfferController {
  // Get offer
  async getOffer(req, res) {
    try {
      const offer = await offerService.offer.getOffer();
      res.status(200).json({
        success: true,
        data: offer
      });
    } catch (error) {
      console.error('Get offer error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get offer'
      });
    }
  }

  // Update offer with image
  async updateOffer(req, res) {
    try {
      const file = req.file;
      const offerData = req.body;
      const offer = await offerService.offer.updateOffer(file, offerData);
      res.status(200).json({
        success: true,
        message: 'Offer updated successfully',
        data: offer
      });
    } catch (error) {
      console.error('Update offer error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update offer'
      });
    }
  }

  // Update offer details only (without image)
  async updateOfferDetails(req, res) {
    try {
      const offerData = req.body;
      const offer = await offerService.offer.updateOfferDetails(offerData);
      res.status(200).json({
        success: true,
        message: 'Offer details updated successfully',
        data: offer
      });
    } catch (error) {
      console.error('Update offer details error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update offer details'
      });
    }
  }
}

export default new OfferController();