/**
\file jquery-element-data-plugin.js
A plugin which collects html element data before beconing to the server 
*/

// w is the window object
(function(w) {

	while (w.top.document !== w.document) {
		// we're in the outermost window
		w = w.parent;
	}
  
	var d = w.document;

	// First make sure BOOMR is actually defined.  It's possible that your plugin is
	// loaded before boomerang, in which case you'll need this.
	BOOMR = BOOMR || {};
	BOOMR.plugins = BOOMR.plugins || {};
    
    var getAmt = function(amtstr) {
		var regex = new RegExp("[^0-9-.]", ["g"]);
		try { 
			unformatted = parseFloat(
				amtstr
				.replace(/\((.*)\)/, "-$1") 
				.replace(regex, '')      
			);
		} catch(err) {}
		return !isNaN(unformatted) ? unformatted : 0;
	};

	// A private object to encapsulate all your implementation details
	// This is optional, but the way we recommend you do it.
	var impl = {
		start_time: "",
        selectors: {}, //an object of selectors with multiple id: {selector: '<jquery selector>', type: 'element/field', dataType: 'text/number'} sttributes
        addedVars: [],
		fetchData: function() {
          var jQuery = w.jQuery || w.$;
          if(jQuery && typeof jQuery === "function") {
            for(var x in impl.selectors) {
              var obj = impl.selectors[x];
              if(!jQuery.isArray(obj)) {
                  obj = [obj];
              }
              for(var i in obj) {
                  var selector = obj[i];
                  var elems = jQuery(selector.selector);
                  if(elems && elems.length) {
                    var data = undefined;
                    if(selector.type == 'field') {
                      data = elems[0].value;
                    } else {
                      data = elems.text();
                    }
                    if(data) {
                      if(selector.dataType == 'number') {
                        data = getAmt(data);
                      }
                      BOOMR.addVar(x, data);
                      impl.addedVars.push(x);
                    }
                  }
              }
            }
          }
		},
        clear: function() {
            if (impl.addedVars && impl.addedVars.length > 0) {
                BOOMR.removeVar(impl.addedVars);
                impl.addedVars = [];
            }
        }
	};

	BOOMR.plugins.jquery_element_data = {
		init: function(config) {
			var properties = ["selectors"];	  // jquery selectors to fetch data from

			// This block is only needed if you actually have user configurable properties
			BOOMR.utils.pluginConfig(impl, config, "jquery_element_data", properties);
      
            BOOMR.subscribe("before_beacon", impl.fetchData, null, impl);
            BOOMR.subscribe("onbeacon", impl.clear, null, impl);
			
			return this;
		},

		// Any other public methods would be defined here

		is_complete: function() {
			// This method should determine if the plugin has completed doing what it
			/// needs to do and return true if so or false otherwise
			impl.start_time = Date.now();
			return true;
		}
	};

}(window));