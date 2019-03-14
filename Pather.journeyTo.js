/* 
  Suggestion for an update to your journey to,
  I added a lot of stuff so there's a bunch of variables I'm using which aren't even declared in your pather 
  but you can get some general ideas of what I'm adding here from the code.
  Most of it works, there's some bugs ;) 
*/

journeyTo2: function (area, portal, force) {
		/*
			Pather.journeyTo(area);
			area - the id of area to move to
		*/
		{//Local variables
			this.enRoute = true;
			Attack.stopLevel = false;
			this.stopCourse = false;
			this.forceTP = false;
			if (this.debugPather) { print("ÿc2Pather: ÿc0journeyTo(area) " + area) } ;
		}
		{//Early exit checks
			if (area <= 0 || !area) { 
				delay(12000);
				return true;
			}

			if (area == me.area) { return true }
			
			if (this.townAreas.indexOf(area) > -1) {
				this.makePortal(true);
				return this.journeyTo2(area);
			}
			
			if(area == 39) { //Cow level
				this.journeyTo2(1);
				Pather.usePortal(39);
				return me.area === area;
			}
		}
		{//Variables
			var i, special, unit, tick, target, areaMessage;
			var tookPortal = false;
		}
		{//Plot the path of areas to go through
			target = this.plotCourse(area, me.area);
			areaMessage = "";
		}
		{//In wrong area, go to town
			if (!me.inTown){ 
				if(!force) {
					if (target.course.indexOf(me.area) == -1) {
						if (this.debugPather) { print("ÿc2Pather: ÿc0Going to town because this area isn't on the way") } ;
						this.makePortal(true);
					}
				}
			}
		}
		{//If a portal was passed, use it
			if(portal) { 
				if (me.inTown) { Town.move("portalspot"); }
				this.usePortal(null,null,copyUnit(portal));
				return this.journeyTo2(area);
			}
		}
		{//Print the planned route
			if (target.course.length>0) { 
				for (i = 0; i<target.course.length; i+=1){
					if (!(target.course[i] == undefined)) {
						if (areaMessage == "") {
							areaMessage +=  this.getAreaName(target.course[i]);
						}else{
							areaMessage += "  -->  " + this.getAreaName(target.course[i]);
						}
					}
				}
				print("  ÿc9Planned course: ÿc0" + areaMessage);
			}else{
				print("  ÿc9Planned course: ÿc0" + this.getAreaName(area));
			}
		}
		{//Check for portals to use from town to cut the journey
			if (target.course.length>0) { 
				if (me.inTown){
					Town.move("portalspot");
					for (i = target.course.length-1; i>=0; i-=1){
						if (target.course[i] && !tookPortal) {
							if(Config.AutoLevel.Leader !== me.name) {
								portal = this.getPortal(target.course[i], Config.AutoLevel.Leader)
								if (portal) {
									this.usePortal(null,null,copyUnit(portal));
									print("ÿc8Town: Took leader's portal back to: ÿc0" + this.getAreaName(target.course[i]));
									return this.journeyTo2(area,null);
								}
							}
							portal = this.getPortal(target.course[i], me.name)
							if (portal) {
								this.usePortal(null,null,copyUnit(portal));
								print("ÿc8Town: Took my portal back to: ÿc0" + this.getAreaName(target.course[i]));
								Pather.makePortal();
								return this.journeyTo2(area,null);
							}
							portal = this.getPortal(target.course[i],null)
							if (portal) {
								this.usePortal(null,null,copyUnit(portal));
								print("ÿc8Town: Took a portal to: ÿc0" + this.getAreaName(target.course[i]));
								Pather.makePortal();
								return this.journeyTo2(area,null);
							}
						}
					}
					
					if(Config.AutoLevel.Leader) { //Don't walk across maps to get the leader, use tp
						if(Config.AutoLevel.Leader !== me.name) {
							if(target.course.length > 3) {
								Town.goToTown();
								delay(1000);
								return false;
							}
						}
					}
				}
			}
		}
		{//Without initiated act, getArea().exits will crash
			if (target.course.indexOf(78) > -1) {
				Town.goToTown(3); 

				special = getArea(78);

				if (special) {
					special = special.exits;

					for (i = 0; i < special.length; i += 1) {
						if (special[i].target === 77) {
							target.course.splice(target.course.indexOf(78), 0, 77); // add great marsh if needed

							break;
						}
					}
				}
			}
		}
		{//Check closest areas for access by wp first 
			for (i = target.course.length-1; i>=0; i-=1){ 
				if (me.inTown && this.wpAreas.indexOf(target.course[i]) > -1 && getWaypoint(this.wpAreas.indexOf(target.course[i]))) {
					this.useWaypoint(target.course[i], true);
					Precast.doPrecast(false);
				}
			}
		}
		{//Try to get wp for the area
			if(!getWaypoint(me.area)) {
				this.getWP(me.area);
			}
			if(this.checkForWP()) {
				print("ÿc2Pather: ÿc0Took waypoint.")
			}
		}
		{//Go to next area
				
			if (!me.inTown) { //Precast
				Precast.doPrecast(false);
			}
			var heading = target.course[1];
			{//Actions based on current area and next area
				switch(me.area) {
					case 4:
						if(heading === 38) { // Stony Field -> Tristram
							this.moveToPreset(me.area, 1, 737, 0, 0, false, true);
							for (i = 0; i < 5; i += 1) {
								if (this.usePortal(38)) {
									break;
								}

								delay(1000);
							}
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 32:
						if(heading === 33) { // Inner Cloiser -> Cathedral
							this.moveToExit(heading, true); //Buggy with the door, to do.
						}else{
							this.moveToExit(heading, true);
						}
						break;						
					case 74:
						if(heading === 46) { // Arcane Sanctuary -> Canyon of the Magi
							this.moveToPreset(me.area, 2, 357);
							for (i = 0; i < 5; i += 1) {
								unit = getUnit(2, 357);

								unit.interact();
								delay(1000);
								me.cancel();

								if (this.usePortal(46)) {
									break;
								}
							}
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 54:
						if (heading === 74) { // Palace -> Arcane
							this.moveTo(10073, 8670);
							this.usePortal(null);
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 109:
						if (heading == 110) { // Harrogath -> Bloody Foothills
							this.moveTo(5026, 5095);

							unit = getUnit(2, 449); // Gate

							if (unit) {
								for (i = 0; i < 3; i += 1) {
									unit.interact();

									tick = getTickCount();

									while (getTickCount() - tick < 3000) {
										if (unit.mode === 2) {
											delay(1000);

											break;
										}
									}
								}
							}

							this.moveToExit(heading, true);
						}else if (heading === 121) { // Harrogath -> Nihlathak's Temple
							Town.move("anya");
							this.usePortal(121);
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 111:
						if (heading === 125) { // Abaddon
							this.moveToPreset(111, 2, 60);
							this.usePortal(125);
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 112:
						if (heading === 126) { // Pits of Archeon
							this.moveToPreset(112, 2, 60);
							this.usePortal(126);
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 117:
						if (heading === 127) { // Infernal Pit
							this.moveToPreset(117, 2, 60);
							this.usePortal(127);
						}else{
							this.moveToExit(heading, true);
						}
						break;
					case 131:
						if (heading == 132) { //To baal!
							Pather.moveTo(15090, 5008);
							while (getUnit(1, 543)) {
								delay(500);
							}
							portal = getUnit(2, 563);
							if (portal) {
								Pather.usePortal(null, null, portal);
							}
						}else{
							this.moveToExit(heading, true);
						}
						break;
					default:
						if (heading === 73) { //Duriel's Lair
							Pather.useUnit(2, 100, 73);
						}else{
							this.moveToExit(heading, true);
						}
						break;
				}
			}
		}
		{//Recursive call for journeyTo per area
			this.enRoute = false;
			Pather.makePortal();
			return this.journeyTo2(area);
		}
	},
