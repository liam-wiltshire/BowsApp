	var global = {
		username : '',
		registration_id : '',
		storage : window.localStorage,

	}


	var prefs = {
		'scanalerts' 	: 	{ value : parseInt("00000001",2), hint : 'Receive alerts for scan requests', name : 'Scanning Alerts' },
		'pref2' 		: 	{ value : parseInt("00000010",2), hint : 'Placeholder preference', name : 'Dummy Pref' },
	}

	var scantypes = {
		p : {
			id : 1,
			name : 'Planet Scan',
		},
		l : {
			id : 2,
			name : 'Landing Scan',
		},
		d : {
			id : 3,
			name : 'Development Scan',
		},
		u : {
			id : 4,
			name : 'Unit Scan',
		},
		n : {
			id : 5,
			name : 'News Scan',
		},
		i : {
			id : 6,
			name : 'Incoming Scan',
		},
		j : {
			id : 7,
			name : 'Jumpgate Scan',
		},
		a : {
			id : 8,
			name : 'Advanced Unit Scan',
		},
	}

	var actions = {

		submitScan: function(url){
			actions.processAjax("act=submitScan&url="+url+"",function(){
				actions.getScanRequests();
				$("#scanURL").val("");
				alert("Scan submitted to BowBot");
			});

		},

		getPrefs : function(){
			actions.processAjax("act=getPrefs&username="+global.username+"&registration_id="+global.registration_id+"",function(data){

				html = "";

				for (i in prefs){
					pref = prefs[i];

					html += '<label for="pref_'+i+'" id="pref_'+i+'_label"><i class="ferme"> </i> <span class="tickimg"><input id="pref_'+i+'" name="setting" type="checkbox" value="'+pref.value+'" ';
					if (data & pref.value){
						html += ' checked="checked" ';
					}
					html += '/><i> </i>'+pref.name+'<br /><strong class="tad-timer"> <i class="tab-text-time">'+pref.hint+'</i></strong></span></label>';

				}

				$("#prefsForm").html(html);

			});
		},

		setPrefs : function(){
			var prefs = 0;
			$fields = $("input[name=setting]");
			$fields.each(function(){
				if ($(this).is(":checked")) {
					prefs = prefs | $(this).val();
				}
			});

			alert("Your prefs is "+prefs+"");
			actions.processAjax("act=setPrefs&prefs="+prefs+"&username="+global.username+"&registration_id="+global.registration_id+"",function(data){
				actions.getPrefs();
			});
		},

		processAjax : function(args,success,fail){
			url = "http://www.pa-rainbows.com/api/api.php?"+args+"";
			$.get(url,function(data){
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
				actions.doReplace({'pt' : data});
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
					global.storage.setItem("username",global.username);
					$(".welcometext").removeClass("hidden");
					$(".login").addClass("hidden");
					actions.doReplace({
						name: global.username
					});
				}else{
					alert(data);
				}
			});

		},
		init : function(){
			//First, get the device ID

			actions.processAjax("act=motd",function(data){
				$(".motd").html(data);
			});


			var push = PushNotification.init({ "android": {"senderID": "544438236481", "sound" : "true", "vibrate" : "true"},
				"ios": {"alert": "true", "badge": "true", "sound": "true", "vibrate" : "true"}, "windows": {} } );

			push.on('registration', function(data) {
				global.registration_id = data.registrationId;

				//Now, are we a recognised user?

				if (global.storage.getItem("username")){
					global.username = global.storage.getItem("username");
					actions.doReplace({
						name: global.username
					});
					actions.getScanRequests();
					actions.getPrefs();
				}else{
					$(".welcometext").addClass("hidden");
					$(".login").removeClass("hidden");

				}

			});

			push.on('notification', function(data) {
				actions.getScanRequests();
			});




		},
		getScanRequests: function(){
			actions.processAjax("act=getScans&username="+global.username+"&registration_id="+global.registration_id+"",function(data){
				x = 0;
				html = "";
				while (x < data.length){
					try {
						scan = data[x];

						html += '<div class="latest-today"><h4>PT: ' + scan.tick + '</h4><h3>' + scantypes[scan.scantype.toLowerCase()].name + ' on ' + scan.x + ':' + scan.y + ':' + scan.z + '</h3><p><a class="doScan btn btn-primary" target="_blank" href="http://game.planetarion.com/waves.pl?id=' + scantypes[scan.scantype.toLowerCase()].id + '&x=' + scan.x + '&y=' + scan.y + '&z=' + scan.z + '">Scan</a> Requested by: <span class="todt-joe"> ' + scan.name + ' </span></p></div>';
						x++;
					}catch (e){
						alert(e);
					}
				}

				$(".latest-act-bot").html(html);

			},function(data){
				alert("Exception: " + data);
			});
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

		$("#refreshScans").on("click",function(){
			actions.getScanRequests();
		});

		$(".doSubmitScan").on("click",function(){
			actions.submitScan($("#scanURL").val());
		});

		$("#setPrefs").on("click",function(){
			alert("Set Prefs!");
			actions.setPrefs();
		})

		$(".latest-act-bot").on("mouseup",".doScan",function(){
			setTimeout(function(){
				url = prompt("Paste the scan URL here and we will submit it back to BowBot");
				if (url){
					actions.submitScan(url);
				}
			},500);
		});


	}

	/*$(function(){
		onDeviceReady();
	})*/
