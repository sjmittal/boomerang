/**
\file form-data-collect-plugin.js
A plugin which serializes form data into fd attribute and adds to the beacon data before beconing to the server 
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
  
    function serialize(form) {
        if (!form || form.nodeName !== "FORM") {
          return;
        }
        var i, j, q = {};
        for (i = form.elements.length - 1; i >= 0; i = i - 1) {
          if (form.elements[i].name === "" && form.elements[i].id === "") {
            continue;
          }
          var name = form.elements[i].name || form.elements[i].id;
          switch (form.elements[i].nodeName) {
          case 'INPUT':
            switch (form.elements[i].type) {
            case 'text':
            case 'number':
            case 'date':
            case 'hidden':
              var value = form.elements[i].value;
              if(value) {
                q[name] = value;
              }
              break;
            case 'checkbox':
            case 'radio':
              if (form.elements[i].checked) {
                if(q[name]) {
                  q[name] = [q[name]].concat(form.elements[i].value);
                } else {
                  q[name] = form.elements[i].value;
                }
              }						
              break;
            default:
              break;
            }
            break;			 
          case 'SELECT':
            switch (form.elements[i].type) {
            case 'select-one':
              var value = form.elements[i].value;
              if(value) {
                q[name] = value;
              }
              break;
            case 'select-multiple':
              q[name] = [];
              for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                if (form.elements[i].options[j].selected) {
                   q[name].push(form.elements[i].options[j].value);
                }
              }
              break;
            }
            break;
          default:
            break;
          }
        }
        return q;
    }

	// A private object to encapsulate all your implementation details
	// This is optional, but the way we recommend you do it.
	var impl = {
		start_time: "",
		form_data: undefined, //will be the form identifier (index/name/id) to serialize

		serializeFormData: function() {
		  var forms = d.forms;
          for(var i = 0; i < forms.length; i++) {
            var form = forms[i];
            if(i === impl.form_data || impl.form_data === form.name || impl.form_data === form.id) {
              var data = serialize(form);
              if(data) {
                BOOMR.addVar('fd', data);
              }
            }
          }
		},
        clear: function() {
            BOOMR.removeVar('fd');
        }
	};

	BOOMR.plugins.form_data = {
		init: function(config) {
			var properties = ["form_data"];	  // form instance to serialize

			// This block is only needed if you actually have user configurable properties
			BOOMR.utils.pluginConfig(impl, config, "form_data", properties);
      
            BOOMR.subscribe("before_beacon", impl.serializeFormData, null, impl);
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