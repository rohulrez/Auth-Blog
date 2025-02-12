function getSessionErrorData (req) {
    let sessionInputData = req.session.inputData;

    if (!sessionInputData) {
      sessionInputData = {
        hasError: false,
        title: '',
        content: '',
      };
    };
    
    req.session.inputData = null;
    
    return sessionInputData;
};


module.exports = {
    getSessionErrorData: getSessionErrorData
};