import ContactRequestModel, {
  validateContactRequestSchema,
  validateContactRequestNoteSchema,
} from '../model/contactRequest'

export const addContactRequest = async (req, res) => {
  try {
    await validateContactRequestSchema(req.body)

    let contactRequest = new ContactRequestModel({
      source: {
        userId: req?.body?.source.userId,
        deviceId: req?.body?.source.deviceId,
      },
      timestamp: req?.body?.timestamp,
      resolve: req?.body?.resolve,
    })

    contactRequest = await contactRequest.save()

    return res.json({
      success: true,
      data: contactRequest,
      message: 'Prośba kontaktu została zgłoszona',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const updateContactrequest = async (req, res) => {
  try {
    const editedContactRequest = await ContactRequestModel.findOneAndUpdate(
      { _id: req.params.id },
      [{ $set: { resolve: { $not: '$resolve' } } }],
      {
        new: true,
      }
    )

    if (!editedContactRequest) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Użytkownik o podanym id nie istnieje',
      })
    }
    return res.json({
      success: true,
      data: editedContactRequest,
      message: 'Prośba o kontakt zmieniona !',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}
export const addNoteToContactrequest = async (req, res) => {
  try {
    await validateContactRequestNoteSchema(req.body)

    const { text, timestamp } = req.body.note

    const editedContactRequest = await ContactRequestModel.findOneAndUpdate(
      { _id: req.params.id },
      [{ $addFields: { note: { text, timestamp } } }],
      {
        new: true,
      }
    )

    if (!editedContactRequest) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Prośba o kontakt o podanym id nie istnieje',
      })
    }
    return res.json({
      success: true,
      data: editedContactRequest,
      message: 'Notatka została dodana !',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const getContactRequestsOfUserByDate = async (req, res) => {
  try {
    const now = new Date(req.query.date).getTime()
    const startOfDate = new Date(now - (now % 86400000)).toISOString()
    const endOfDate = new Date(
      now - (now % 86400000) + (86400000 - 1)
    ).toISOString()

    const users = await ContactRequestModel.find({
      $and: [
        { 'source.userId': req.params.id },
        { timestamp: { $gte: startOfDate, $lte: endOfDate } },
      ],
    })

    return res.status(200).json({
      success: true,
      data: users,
      message: 'Pobrano prośby kontaktu !',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}
