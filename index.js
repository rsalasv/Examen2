const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const {
    IamAuthenticator
} = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2021-03-25',
    authenticator: new IamAuthenticator({
        apikey: process.env.UNL_KEY,
    }),
    serviceUrl: process.env.UNL_URL,
});

exports.handler = async (event, context, callback) => {

    const analyzeParams = {
        'text': event.historial_clinico,
        'features': {
            'entities': {
                'emotion': true,
                'sentiment': true,
                'limit': 5
            },
            'keywords': {
                'emotion': true,
                'sentiment': true,
                'limit': 5
            }
        }
    };

    const res = await naturalLanguageUnderstanding.analyze(analyzeParams)
    let keywordsArray = []
    for (let i = 0; i < res.result.keywords.length; i++) {
        keywordsArray.push(res.result.keywords[i].text)
    }
    let entidadesArray = []
    for (let i = 0; i < res.result.entities.length; i++) {
        entidadesArray.push(res.result.entities[i].text)
    }

    let palabrasClaveDesc = {}
    for (let i = 0; i < res.result.keywords.length; i++) {
        let newKeyword = {
            "sentimiento": res.result.keywords[i].sentiment.label,
            "relevancia": res.result.keywords[i].relevance,
            "repeticiones": res.result.keywords[i].count,
            "emocion": getMaxEmotion(res.result.keywords[i].emotion)


        }

        palabrasClaveDesc[res.result.keywords[i].text] = newKeyword

    }
    let entidadesDesc = {}
    for (let i = 0; i < res.result.entities.length; i++) {
        let newEntity = {
            "tipo": res.result.entities[i].type,
            "sentimiento": res.result.entities[i].sentiment.label,
            "relevancia": res.result.entities[i].relevance,
            "emocion": getMaxEmotion(res.result.entities[i].emotion),
            "repeticiones": res.result.entities[i].count,
            "porcentaje_confianza": res.result.entities[i].confidence


        }

        entidadesDesc[res.result.keywords[i].text] = newEntity

    }
    JSONResponse = {
        "lenguaje_texto": res.result.language,
        "palabras_clave": keywordsArray,
        "entidades": entidadesArray,
        "palabras_clave_desc": palabrasClaveDesc,
        "entidades_desc": entidadesDesc
    }

    return JSONResponse;

    function getMaxEmotion(arr) {
        var maxEmotion;
        var maxValue;


        for (let emotion in arr) {
            if (maxValue == null) {
                maxEmotion = emotion
                maxValue = arr[emotion]

            } else if (maxValue < arr[emotion]) {
                maxValue = arr[emotion]
                maxEmotion = emotion
            }
        }


        return maxEmotion;
    }
};