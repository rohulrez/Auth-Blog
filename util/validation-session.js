
function getSessionErrorData (req, defaultvalues) {
    let sessionInputData = req.session.inputData;

    if (!sessionInputData) {
      sessionInputData = {
        hasError: false,
       ...defaultvalues
      };
    };
    
    req.session.inputData = null;
    
    return sessionInputData;
  }

  flashErrorsToSession = (req, data, action) =>{
      req.session.inputData = {
        hasError: true,
        ...data 
    };

    req.session.save(action);
  }
    



module.exports = {
  getSessionErrorData : getSessionErrorData,
  flashErrorsToSession: flashErrorsToSession,
};