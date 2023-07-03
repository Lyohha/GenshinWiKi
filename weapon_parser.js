$(document).ready(function() {

    var script = document.createElement('script');	
    script.src = 'https://stuk.github.io/jszip/dist/jszip.js';

    document.head.appendChild(script);


    console.log('weapon parser');

    let $table = $('.article-table');

    let $trs = $table.find('tr');

    let index = 1;

    let weapons = {};

    const zip = new JSZip(); 

    function generateZIP() {
        console.log(weapons);
        // console.log(JSON.stringify(weapons));

        zip.generateAsync({type:"blob"}).then(function(content) {
            let $download = document.createElement('a');
            $download.setAttribute('href', URL.createObjectURL(content));
            $download.setAttribute('download', 'weapon.zip');
            
            $download.click();
        });
    }


    function parseWeapon() {

        if(index == $trs.length) {
        // if(index == 4) {
            generateZIP();
            return;
        }

        let $tr = $($trs[index]);
        
        let $tds = $tr.find('td');

        let weapon = {
            'name': null,
            'type': null,
            'stars': null,
            'main_stat': null,
            'additional_stat': null,
            'passive': null,
            'material_days': [],
            'characters': [],
            'image': null,
        };

        let id = 'weapon_' + index;

        let $a = $($tds[1]).find('a');

        let link = $a.attr('href');
        
        weapon.name = $a.html();

        console.log($a.html());

        weapon.stars = $($tds[2]).find('img').attr('alt').split(' ')[0];

        weapon.main_stat = 'Базовая атака <br>' + $tds[3].innerHTML;
        weapon.additional_stat = $tds[4].innerHTML.replaceAll('<br><br>', '<br>');

        let $content;

        function getAdditionalInfo() {
            let $type = $content.find('[data-source="Тип"]');

            let $a = $type.find('a');

            weapon.type = $a[$a.length - 1].innerHTML;

            weapons[id] = weapon;

            index++;
            setTimeout(function() {
                parseWeapon();
            }, 1000);
        }

        function getPassive() {
            let $tabs = $content.find('.wds-tabber');

            let $tab = $($tabs[$tabs.length - 1]);

            let $tabtds = $tab.find('td');

            let stats = {};

            let mainText = $tabtds[0].innerHTML;

            let firstMatch = mainText.match(/<b>.+?<\/b>/g);

            if(firstMatch != null) {

                for(let i = 0; i < firstMatch.length; i++) {
                    stats[i] = firstMatch[i].replaceAll('<b>', '').replaceAll('</b>', '');
                }

                for(let j = 1; j < $tabtds.length; j++) {
                    let text = $tabtds[j].innerHTML;

                    let match = text.match(/<b>.+?<\/b>/g);

                    for(let i = 0; i < firstMatch.length; i++) {
                        if(match[i] == null)
                            break;
                        stats[i] += '/' + match[i].replaceAll('<b>', '').replaceAll('</b>', '');
                    }
                }

                for(let i = 0; i < firstMatch.length; i++) {
                    mainText = mainText.replaceAll(firstMatch[i], '<b>' + stats[i] + '</b>');
                }
            }

            weapon.passive = mainText;

            getAdditionalInfo();
        }

        function downloadImage(src) {

            let name = src.split('/revision')[0];

            name = name.split('.');
            name = name[name.length - 1];

            name = id + '.' + name;

            weapon.image = name;


            let xhttp = new XMLHttpRequest();
            xhttp.responseType = 'blob';
            xhttp.onload = function() {
                let imageFile = new File([this.response], name, {type: this.response.type,});
                
                zip.file(name, imageFile);

                getPassive();
            }
            xhttp.onerror = function() {
                console.log('error download weapon image');
            };
            xhttp.open("GET", src, true);
            xhttp.send();
        }

        function parsePage() {
            let xhttp = new XMLHttpRequest();
			
			xhttp.onload = function() {
				$content = $(this.responseText);
				
                let $image = $($content.find('.pi-image-thumbnail')[0]);

                downloadImage($image.attr('src'));
			}
			
			xhttp.onerror = function() {
				console.log('error load page ' + link);
			};
			xhttp.open("GET", link, true);
			xhttp.send();
        }

        parsePage();
        
    }
    
    setTimeout(function() {
        parseWeapon();
    }, 3000);
});

// filter links
/*
$(document).ready(function() {
    for (const [id, obj] of Object.entries(weapons)) {

        let text = obj.passive;
        let matches = text.match(/<a.+?<\/a>/g);

        if(matches == null)
            continue;

        for(let i = 0; i < matches.length; i++) {
            let inner = matches[i].match(/>.+?</g);

            console.log(inner);

            inner = inner[0].replaceAll('>', '').replaceAll('<', '');

            obj.passive = obj.passive.replaceAll(matches[i], inner);
        }

        weapons[id] = obj;
    }

    console.log(weapons);
});*/