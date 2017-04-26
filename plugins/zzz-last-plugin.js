BOOMR.t_end = new Date().getTime();

var getParentCookies = function(){
  var pairs = parent.document.cookie.split(";");
  var cookies = {};
  for(var i = 0; i < pairs.length; i++){
    var pair = pairs[i].split("=");
    if(pair.length == 2) {
       cookies[pair[0].trim()] = unescape(pair[1]);
    }
  }
  return cookies;
};

var getAmt =	function(amtstr) {
  var regex = new RegExp("[^0-9-.]", ["g"]);
  var unformatted;
  try { 
    unformatted = parseFloat(
      amtstr
      .replace(/\((.*)\)/, "-$1") 
      .replace(regex, '')      
    );
  } catch(err) {}
  return !isNaN(unformatted) ? unformatted : 0;
};
  
