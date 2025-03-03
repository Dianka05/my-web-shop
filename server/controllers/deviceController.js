const uuid = require('uuid')
const path = require('path')
const ApiError = require('../error/ApiError')

const {Device, DeviceInfo} = require('../models/models')

class DeviceController {
    async create(req, res, next) {
        // return res.join({message: req})
       try {
            let { name, price, typeId, brandId, info } = req.body
            const {img} = req.body.files
            if (!req.files || !req.files.img) {
                return next(ApiError.badRequest("No file uploaded"));
            }
            let fileName = uuid.v4() + '.' + img.name.split('.').pop()
            img.mv(path.join(__dirname, '..', 'static', fileName))
            const device = await Device.create({name, price, typeId, brandId, info, img: fileName})

            if (info) {
                info = JSON.parse(info)
                info.forEach(item => {
                    DeviceInfo.create({
                        title: item.title,
                        description: item.description,
                        deviceId: item.id
                    })
                })
            }
    
    
            res.join(device)
       } catch (error) {
            next(ApiError.badRequest(error.message))
       }
    }
    async getAll(req, res) {
        let {brandId, typeId, limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        let devices;
        if (!brandId && !typeId) {
            devices = await Device.findAndCountAll({limit, offset})
        }
        if (brandId && !typeId) {
            devices = await Device.findAndCountAll({where:{brandId}, limit, offset})
        }
        if (!brandId && typeId) {
            devices = await Device.findAndCountAll({where:{typeId}, limit, offset})
        }
        if (brandId && typeId) {
            devices = await Device.findAndCountAll({where:{typeId, brandId}, limit, offset})
        }
        return res.json(devices)
    }
    async getOne(req, res) {
        const {id} = req.params
        const device = await Device.findOne(
            {
                where:{id}, 
                include: [{
                    model: DeviceInfo,
                    as: 'info'
                }]
            }
        )
        return res.json(device)
    }
}

module.exports = new DeviceController()