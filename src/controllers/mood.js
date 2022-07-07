import MoodModel, { validateMoodModel } from '../model/mood'

export const addMood = async (req, res) => {
  try {
    await validateMoodModel(req.body)

    let mood = new MoodModel({
      source: {
        userId: req?.body?.source.userId,
        deviceId: req?.body?.source.deviceId,
      },
      timestamp: req?.body?.timestamp,
      mood: req?.body?.mood,
    })

    mood = await mood.save()

    return res.json({
      success: true,
      data: mood,
      message: 'Dziękujemy za wskazanie swojego nastroju',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const getUserMoods = async (req, res) => {
  try {
    const userMoods = await MoodModel.aggregate([
      { $match: { 'source.userId': req.params.id } },
    ]).exec()

    if (!userMoods.length) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Użytkownik o podanym id nie ma przypisanych żadnych nastroi',
      })
    }
    return res.json({
      success: true,
      data: userMoods,
      message: 'Użytkownik znaleziony',
    })
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}
