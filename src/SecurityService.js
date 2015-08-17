
import lang from 'dojo/_base/lang';

let __class;

/**
 * @class argos.SecurityService
 * Security service provides functions that provide field level security methods.
 * @alternateClassName SecurityService
 * @singleton
 */
__class = lang.setObject('argos.SecurityService', {
  hasFieldSecurityProfile: function(entry){
    if (entry && entry.$securityProfile){
      return true;
    }  
    return false;
  },
  getFieldSecurityProfile: function(entry, property){
    if (this.hasFieldSecurityProfile(entry)){
      let profile = entry.$securityProfile[property];
      if(profile){
        return {
          allowRead: profile.allowRead,
          allowWrite: profile.allowWrite
        };
      }      
    }    
    return null;
  }
});
export default __class;
