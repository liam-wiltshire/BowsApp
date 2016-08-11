

	var global = {
		username : '',
		registration_id : '',
		storage : window.localStorage,

	}

	var actions = {

		processAjax : function(args,success,fail){
			$.get("http://www.pa-rainbows.com/api/api.php?"+args+"",function(data){
				if (data.success == true){
					success(data.data);
				}else{
					if (!fail) {
						alert(data.error);
					}else {
						fail(data.error);
					}
				}
			},'json');
		},
		getTick : function(){
			actions.processAjax("act=currentTick",function(data){
				actions.doReplace({'tick' : data});
			});
		},

		doReplace : function(data){
			for (i in data){
				$("[data-replace="+i+"]").html(data[i]);
			}
		},
		processLogin : function(ele){
			$form = $(ele).parents("form");
			data = $form.serialize();
			data += "&registration_id="+global.registration_id+"";

			actions.processAjax(data,function(data){
				if ($("#act-login").is(":checked")){
					global.username = $("input[name=username]").val();
					$(".welcometext").removeClass("hidden");
					$(".login").addClass("hidden");
					action.doReplace({
						username: global.username
					});
				}else{
					alert(data);
				}
			});

		},
		init : function(){
			//First, get the device ID


			var push = PushNotification.init({ "android": {"senderID": "544438236481"},
				"ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );

			push.on('registration', function(data) {
				global.registration_id = data.registrationId;
			});

			push.on('notification', function(data) {
				alert(data.title+" Message: " +data.message);
			});

			//Now, are we a recognised user?

			if (global.storage.getItem("username")){
				global.username = global.storage.getItem("username");
			}else{
				$(".welcometext").addClass("hidden");
				$(".login").removeClass("hidden");
				
			}


		}

	}




	document.addEventListener("deviceready",onDeviceReady,false);
	function onDeviceReady(){

		actions.init();

		actions.getTick();
		setInterval(actions.getTick,30000);

		$("#processLogin").on("click",function(){
			actions.processLogin(this);
		});


	}

	/*$(function(){
		onDeviceReady();
	})*/
