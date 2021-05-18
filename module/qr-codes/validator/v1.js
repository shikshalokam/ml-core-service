/**
 * name : qr-code/validator/v1.js
 * author : Aman Jung Karki
 * created-date : 27-Feb-2020
 * Description : All qr code validation
 */

module.exports = (req) => {
    let qrCodeValidator = {
        image : function () {
            req.checkParams('_id').exists().withMessage("Unique Code is required")
        },
        pdf : function () {
            req.checkBody('codes').exists().withMessage("required qr code data array")
        }
    }

    if (qrCodeValidator[req.params.method]) {
        qrCodeValidator[req.params.method]()
    }
}