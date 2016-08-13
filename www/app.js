

	var global = {
		username : '',
		registration_id : '',
		storage : window.localStorage,

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


			var push = PushNotification.init({ "android": {"senderID": "544438236481"},
				"ios": {"alert": "true", "badge": "true", "sound": "true"}, "windows": {} } );

			push.on('registration', function(data) {
				global.registration_id = data.registrationId;

				//Now, are we a recognised user?

				if (global.storage.getItem("username")){
					global.username = global.storage.getItem("username");
					actions.doReplace({
						name: global.username
					});
					actions.getScanRequests();
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

						html += '<div class="latest-today"><h4>PT: ' + scan.tick + '</h4><h3>' + scantypes[scan.scantype.toLowerCase()].name + ' on ' + scan.x + ':' + scan.y + ':' + scan.z + '</h3><p><a class="doScan btn btn-primary" target="_blank" href="http://game.planetarion.com/waves.pl?id=' + scantypes[scan.scantype.toLowerCase()].id + '&x=' + scan.x + '&y=' + scan.y + '&z=' + scan.x + '">Scan</a> Requested by: <span class="todt-joe"> ' + scan.name + ' </span></p></div>';
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

		$(".latest-act-bot").on("click",".doScan",function(){
			url = prompt("Paste the scan URL here and we will submit it back to BowBot");
			if (url){
				alert(url);
			}
		});


	}

	/*$(function(){
		onDeviceReady();
	})*/
