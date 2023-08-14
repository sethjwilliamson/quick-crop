window.onload = function () {

    'use strict';

    var FileSaver = window.FileSaver;
    var JSZip = window.JSZip;

    var Cropper = window.Cropper;
    var URL = window.URL || window.webkitURL;
    var container = document.querySelector('.img-container');
    var image = container.getElementsByTagName('img').item(0);
    var actions = document.getElementById('actions');
    var dataX = document.getElementById('dataX');
    var dataY = document.getElementById('dataY');
    var dataHeight = document.getElementById('dataHeight');
    var dataWidth = document.getElementById('dataWidth');
    var dataRotate = document.getElementById('dataRotate');
    var dataScaleX = document.getElementById('dataScaleX');

    var options = {
        aspectRatio: document.getElementById('aspect1').value / document.getElementById('aspect2').value,
        preview: '.img-preview',
        ready: function (e) {
            //console.log(e.type);
        },
        cropstart: function (e) {
            //console.log(e.type, e.detail.action);
        },
        cropmove: function (e) {
            //console.log(e.type, e.detail.action);
        },
        cropend: function (e) {
            //console.log(e.type, e.detail.action);
        },
        crop: function (e) {
            var data = e.detail;

            //console.log(e.type);
            dataX.value = Math.round(data.x);
            dataY.value = Math.round(data.y);
            dataHeight.value = Math.round(data.height);
            dataWidth.value = Math.round(data.width);
            dataRotate.value = typeof data.rotate !== 'undefined' ? data.rotate : '';
            dataScaleX.value = typeof data.scaleX !== 'undefined' ? data.scaleX : '';
            dataScaleY.value = typeof data.scaleY !== 'undefined' ? data.scaleY : '';
        },
        zoom: function (e) {
            //console.log(e.type, e.detail.ratio);
        }
    };
    var cropper = new Cropper(image, options);
    var originalImageURL = image.src;
    var uploadedImageType = 'image/jpeg';
    var uploadedImageURL;

    var fileName;
    var arrayCroppedImages = [];
    var arrayUncroppedImages = [];
    var scaleX = 1;

    // Tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Buttons
    if (!document.createElement('canvas').getContext) {
        $('button[data-method="getCroppedCanvas"]').prop('disabled', true);
    }

    if (typeof document.createElement('cropper').style.transition === 'undefined') {
        $('button[data-method="rotate"]').prop('disabled', true);
        $('button[data-method="scale"]').prop('disabled', true);
    }

    // Download
    //if (typeof download.download === 'undefined') {
    //    download.className += ' disabled';
    //}

    // Options
    actions.querySelector('.docs-toggles').onchange = function (event) {
        var e = event || window.event;
        var target = e.target || e.srcElement;
        var cropBoxData;
        var canvasData;
        var isCheckbox;
        var isRadio;

        if (!cropper) {
            return;
        }

        if (target.tagName.toLowerCase() === 'label') {
            target = target.querySelector('input');
        }

        isCheckbox = target.type === 'checkbox';
        isRadio = target.type === 'radio';

        if (isCheckbox || isRadio) {
            if (isCheckbox) {
                options[target.name] = target.checked;
                cropBoxData = cropper.getCropBoxData();
                canvasData = cropper.getCanvasData();

                options.ready = function () {
                    cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
                };
            } else {
                options[target.name] = target.value;
                options.ready = function () {
                    
                };
            }

            // Restart
            cropper.destroy();
            cropper = new Cropper(image, options);
        }
    };

    // Methods
    actions.querySelector('.docs-buttons').onclick = function (event) {
        var e = event || window.event;
        var target = e.target || e.srcElement;
        var cropped;
        var result;
        var input;
        var data;

        if (!cropper) {
            return;
        }

        while (target !== this) {
            if (target.getAttribute('data-method')) {
                break;
            }

            target = target.parentNode;
        }

        if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
            return;
        }

        data = {
            method: target.getAttribute('data-method'),
            target: target.getAttribute('data-target'),
            option: target.getAttribute('data-option') || undefined,
            secondOption: target.getAttribute('data-second-option') || undefined
        };

        cropped = cropper.cropped;

        if (data.method) {
            if (typeof data.target !== 'undefined') {
                input = document.querySelector(data.target);

                if (!target.hasAttribute('data-option') && data.target && input) {
                    try {
                        data.option = JSON.parse(input.value);
                    } catch (e) {
                        console.log(e.message);
                    }
                }
            }

            switch (data.method) {
                case 'rotate':
                    if (cropped) {
                        cropper.clear();
                    }

                    break;

                case 'getCroppedCanvas':
                    try {
                        data.option = JSON.parse(data.option);
                    } catch (e) {
                        console.log(e.message);
                    }

                    if (uploadedImageType === 'image/jpeg') {
                        if (!data.option) {
                            data.option = {};
                        }

                        data.option.fillColor = '#fff';
                    }

                    break;

                case 'download':
                    //return download();
            }

            if (data.method == "setAspectRatio") {
                console.log(document.getElementById('aspect1').value)
                if (document.getElementById('aspect1').value !== "" && document.getElementById('aspect2').value !== "") {
                    cropper.setAspectRatio(document.getElementById('aspect1').value / document.getElementById('aspect2').value);
                    options.aspectRatio = document.getElementById('aspect1').value / document.getElementById('aspect2').value;
                }
                else
                    cropper.setAspectRatio(null);
            }
            else if (data.method == "setAspectRatioIcon") {
                cropper.setAspectRatio(1);
                options.aspectRatio = 1;
            }

            else if (data.method == "setAspectRatioBanner") {
                cropper.setAspectRatio(21 / 5);
                options.aspectRatio = 21 / 5;
            }
            else {
                result = cropper[data.method](data.option, data.secondOption);
            }

            switch (data.method) {
                case 'rotate':
                    if (cropped) {
                        cropper.crop();
                    }

                    break;

                case 'scaleX':
                case 'scaleY':
                    target.setAttribute('data-option', -data.option);
                    break;

                
                

                case 'getCroppedCanvas':
                    if (result) {
                        let newFileName = fileName.split('-')[0].split('.')[0] + ".png"

                        arrayCroppedImages.push({"file": result.toDataURL(), "name": newFileName});

                        //options.width = result.width
                        //options.height = result.height
                        options.data=cropper.getData();
                        options.autoCrop = true;

                        nextImage();
                    }

                    break;

                case 'destroy':
                    cropper = null;

                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                        uploadedImageURL = '';
                        image.src = originalImageURL;
                    }

                    break;
            }

            if (typeof result === 'object' && result !== cropper && input) {
                try {
                    input.value = JSON.stringify(result);
                } catch (e) {
                    console.log(e.message);
                }
            }
        }
    };

    document.body.onkeydown = function (event) {
        var e = event || window.event;

        if (!cropper || this.scrollTop > 300) {
            return;
        }

        switch (e.keyCode) {
            case 82:
                document.getElementById("cropper-scale-x").click()
                e.preventDefault();
                //console.log(cropper)
                //dataScaleX = -scaleX;
                //cropper.scaleX(scaleX);
                break;
            case 32:
                e.preventDefault();
                //nextImage();
                document.getElementById("next-image").click()
                break;
            case 13:
                e.preventDefault();
                //nextImage();
                document.getElementById("next-image").click()
                break;
            case 37:
                e.preventDefault();
                cropper.move(-1, 0);
                break;

            case 38:
                e.preventDefault();
                cropper.move(0, -1);
                break;

            case 39:
                e.preventDefault();
                cropper.move(1, 0);
                break;

            case 40:
                e.preventDefault();
                cropper.move(0, 1);
                break;
        }
    };

    // Import image
    var inputImage = document.getElementById('inputImage');

    if (URL) {
        inputImage.onchange = function () {
            var files = this.files;
            var file;
            arrayUncroppedImages = []
            arrayCroppedImages = []
            //var file;

            if (cropper && files && files.length) {
                //file = files[0];

                for (file of files) {
                    console.log(file)
                    if (/^image\/\w+/.test(file.type)) {
                        uploadedImageType = file.type;
    
                        if (uploadedImageURL) {
                            URL.revokeObjectURL(uploadedImageURL);
                        }
    
                        arrayUncroppedImages.push(file);
                    } else {
                        window.alert('Please choose an image file.');
                        break;
                    }
                }
            }

            arrayUncroppedImages.sort((a, b) => a.size - b.size)

            nextImage();
        };
    } else {
        inputImage.disabled = true;
        inputImage.parentNode.className += ' disabled';
    }

    function nextImage() {
        console.log(arrayCroppedImages)
        if (arrayUncroppedImages.length > 0) {
            var file = arrayUncroppedImages.pop();
        
            fileName = file.name;
            image.src = uploadedImageURL = URL.createObjectURL(file);

            let set = fileName[1]
            let cardCode = fileName.split('-')[0].split('.')[0]

            let url = "'https://dd.b.pvp.net/2_14_0/set" + set + "/en_us/img/cards/" + cardCode + ".png'"

            console.log(url)

            document.getElementById("card-preview").style.backgroundImage = "url(" + url + ")"

            cropper.destroy();

            cropper = new Cropper(image, options);
        }
        else {
            //download.href = arrayCroppedImages[0];
            download();            
        }

        if (arrayCroppedImages.length % 20 == 0 && arrayCroppedImages.length != 0) {
            download()
        }
    }
    function download() {
        let zip = new JSZip();

        let zipName = "Cropped " + arrayCroppedImages[0].name + ".zip"

        for (let file of arrayCroppedImages) { 
            zip.file(file.name, file.file.split('base64,')[1], {base64: true})
        }

        console.log(zip)

        zip.generateAsync(
            {
                type: "blob",
                compressionOptions: {
                    level: 2
                }
            }).then(
            function(content) {
                saveAs(content, zipName);
            }
        );

        arrayCroppedImages.splice(0)
    }
};

