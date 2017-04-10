/**
\file clicks.js
A plugin beaconing clicked elements back to the server
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

	// A private object to encapsulate all your implementation details
	// This is optional, but the way we recommend you do it.
	var impl = {
		start_time: "",
		click_url: "", //will be the default beacon url,
    click_tags: [], //array of target tag names (in uppercase) that are allowed
    click_classes: [], //array of class names for those nodes that are allowed
		handleEvent: function(event) {
			if (typeof impl.click_url === "undefined" ) {
				BOOMR.error("No Beacon URL defined will not send beacon");
				return;
			}

			var target = null;
			if (event.target) { target = event.target; }
			else if (event.srcElement) { target = event.srcElement; }
			var data = {
				element: target.nodeName,
				id: target.id,
				"class": target.classList
			}, foundClass = impl.accept(data);

			if(foundClass) {
				BOOMR.info(target.nodeName + " clicked, will send immediately");
        data["class"] = foundClass;
        data["text"] =  target.innerText || target.value;
        if(data["text"])
          impl.sendData(data);
      }
		},
    accept: function(node) {
      var tagName = node.element.toUpperCase();
      var classList = node["class"];
      if(click_tags.indexOf(tagName) > -1) {
        for (var i = 0; i < classList.length; i++) {
          var className = classList[i];
          if(click_classes.indexOf(className) > -1) {
            return className;
          }
        }
      }
      return false;
    },
		sendData: function(data) {
			BOOMR.addVar(data);

      this.complete = true;
      
      if(BOOMR.plugins.RT) {
        BOOMR.plugins.RT.done(null, "click");
      } else 	{	
        BOOMR.sendBeacon();
      }
		}

	};

	BOOMR.plugins.clicks = {
		init: function(config) {
			var properties = ["click_url"];	  // URL to beacon

			// This block is only needed if you actually have user configurable properties
			BOOMR.utils.pluginConfig(impl, config, "clicks", properties);

			// Other initialisation code here
			w.addEventListener("click", impl.handleEvent, true);
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
