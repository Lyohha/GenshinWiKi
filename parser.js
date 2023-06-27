jQuery(document).ready(function($) {
    var script = document.createElement('script');	
    script.src = 'https://stuk.github.io/jszip/dist/jszip.js';

    document.head.appendChild(script);

    // ждать библиотеку
    setTimeout(function() {
    
        const genJsonFiles = false;


        let id = document.location.pathname.replaceAll('/', '');;
        let title;
        let desc;

        var artifacts = {};
        var characters = {};
        var charactersArray = [];

        const zip = new JSZip(); 
        
        function getArtifact() {
            let $table = $($('.wp-block-table')[0]);
        
            let $td = $table.find('td');
            
            desc = $td[1].innerHTML;
            title = $td[0].innerHTML.split('<br>')[1];
            
            $td = $($td[0]);
            
            let $image = $td.find('img');
            let src = $image.attr('src');

            let xhttp = new XMLHttpRequest();
            xhttp.responseType = 'blob';
            xhttp.onload = function() {
                let imageFile = new File([this.response], id + '.webp', {type: this.response.type,});
                
                zip.file(id + '.webp', imageFile);

                getCharacters();
            }
            xhttp.onerror = function() {
                console.log('error download artifact image');
            };
            xhttp.open("GET", src, true);
            xhttp.send();
        }


        

        function getCharacters() {
            // let $characters = $($('.wp-block-table.aligncenter')[1]).find('a');
            let $characters = $($('.wp-block-table')[4]).find('a');
            // let $characters = $($('.wp-block-table')[5]).find('a');
            
            recursiveDownloadCharacters();

            function recursiveDownloadCharacters(index = 0) {
            
                let $a = $($characters[index]);

                let src = $a.find('img').attr('src');

                let id = $a.attr('href').replace(document.location.origin, '').replaceAll('/', '');

                let name = $a.html().split('<br>')[1];

                let obj = {
                    name: name,
                };

                characters[id] = obj;

                charactersArray.push(id);

                let file = new File([JSON.stringify(obj)], id + '.json', {type: 'application/json',});
                
                if(genJsonFiles)
                    zip.file(id + '.json', file);


                let xhttp = new XMLHttpRequest();
                xhttp.responseType = 'blob';
                xhttp.onload = function() {
                    let imageFile = new File([this.response], id + '.webp', {type: this.response.type,});
                    
                    zip.file(id + '.webp', imageFile);
        
                    index++;
                    index < $characters.length ? recursiveDownloadCharacters(index) : finishInfo();
                }
                xhttp.onerror = function() {
                    console.log('error download character image');
                };
                xhttp.open("GET", src, true);
                xhttp.send();
            }

        }

        
        function finishInfo() {

            artifacts[id] = {
                title: title,
                desc: desc,
                characters: charactersArray,
            };

            let file = new File([JSON.stringify(artifacts)], id + '.json', {type: 'application/json',});
            if(genJsonFiles)
                zip.file(id + '.json', file);

            console.log(id);
            console.log(artifacts);
            console.log(characters);
            console.log('TEXT');
            console.log(JSON.stringify(artifacts));
            console.log(JSON.stringify(characters));

            zip.generateAsync({type:"blob"}).then(function(content) {
                let $download = document.createElement('a');
                $download.setAttribute('href', URL.createObjectURL(content));
                $download.setAttribute('download', id + '.zip');
                
                $download.click();
            });
        }

        getArtifact();

    }, 2000);

    

});