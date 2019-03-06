Element.NativeEvents.tap = 2;
var canClick = {};
var clickEventType = 'tap';
if (Browser.platform == 'android' && Browser.name == 'chrome') {
    clickEventType = 'click';
}
window.addEvent('domready', function() {
    spinner = new Spinner({
        lines: 15,
        length: 29,
        width: 10,
        radius: 43,
        corners: 1,
        rotate: 0,
        direction: 1,
        color: '#555',
        speed: 2.0,
        trail: 25,
        shadow: false,
        hwaccel: true,
        className: 'spinner',
        zIndex: 2e9,
        top: '50%',
        left: '50%'
    });
    window.addEvent('measurementListReady', populateMeasurementList);
    window.addEvent('measurementListReady', populateProgressBar);
    window.addEvent('measurementListReady', function() {
        if (window.list.allMeasurementsHaveValues() || window.list.parameters.isSizeMe) {
            $('storeMeasurementsButton').addClass('trustyButton');
            $('storeMeasurementsButton').removeProperty('disabled');
            $('storeMeasurementsButton').addEvent('click', showNameProfileModal);
            $('progressSaveButton').addClass('activated');
            $('progressSaveButton').addEvent(clickEventType, showNameProfileModal);
        } else {
            $('storeMeasurementsButton').removeEvent('click', showNameProfileModal);
            $('storeMeasurementsButton').setProperty('disabled');
            $('storeMeasurementsButton').removeClass('trustyButton');
            $('progressSaveButton').removeClass('activated');
            $('progressSaveButton').removeEvent('click');
        }
        checkMeasurementUnitAndSetDisplay();
    });
    window.addEvent('sizeMeDataLoaded', function(event) {
        $('measurement-input').removeClass('hide');
        if (this.list.allMeasurementsHaveValues() || window.list.parameters.isSizeMe) {
            $('storeMeasurementsButton').addClass('trustyButton');
            $('storeMeasurementsButton').removeProperty('disabled');
            $('storeMeasurementsButton').addEvent('click', showNameProfileModal);
            $('progressSaveButton').addClass('activated');
            $('progressSaveButton').addEvent(clickEventType, showNameProfileModal);
        } else {
            $('storeMeasurementsButton').removeEvent('click', showNameProfileModal);
            $('storeMeasurementsButton').setProperty('disabled');
            $('storeMeasurementsButton').removeClass('trustyButton');
            $('progressSaveButton').removeClass('activated');
            $('progressSaveButton').removeEvent('click');
        }
        closeModal();
    });
    window.addEvent('sizeMeDataFailed', function(event) {
        spinner.stop();
        var message = jsLang['SIZEME_FAILED'];
        popMessage(message, 'confirmMessage', function() {});
    });
    $$('.toggle-switch input[type="radio"]').addEvent('click', function(event) {
        var unitElement = document.getElement('.toggle-switch input[type="radio"]:checked');
        if (unitElement.getProperty('value') == "metric") {
            if (window.list.parameters.unit != 'cm') {
                window.list.parameters.unit = 'cm';
                if ($('sizeMeMetricWeight').get('value').length > 0)
                    $('sizeMeMetricWeight').set('value', Math.round(lbsToKg($('sizeMeMetricWeight').get('value'))));
                if ($('sizeMeMetricNeck').get('value').length > 0)
                    $('sizeMeMetricNeck').set('value', Math.round(inchToCm($('sizeMeMetricNeck').get('value'))));
                var height = $('sizeMeImperialHeight').getSelected()[0].get('value').toFloat();
                if (height > 0)
                    $('sizeMeMetricHeight').set('value', Math.round(height));
                calculateNeckMeasurement();
            }
        } else {
            if (window.list.parameters.unit != 'in') {
                window.list.parameters.unit = 'in';
                if ($('sizeMeMetricWeight').get('value').length > 0)
                    $('sizeMeMetricWeight').set('value', kgToLbs($('sizeMeMetricWeight').get('value')));
                if ($('sizeMeMetricNeck').get('value').length > 0)
                    $('sizeMeMetricNeck').set('value', cmToInch($('sizeMeMetricNeck').get('value')));
                if ($('sizeMeMetricHeight').get('value').length > 0) {
                    var height = $('sizeMeMetricHeight').get('value').toFloat();
                    var minDiff = 10;
                    Array.each($('sizeMeImperialHeight').options, function(opt, index) {
                        var value = opt.get('value').toFloat();
                        var diff = Math.abs(value - height);
                        if (diff < minDiff) {
                            minDiff = diff;
                            $('sizeMeImperialHeight').selectedIndex = index;
                        }
                    });
                }
                calculateNeckMeasurement();
            }
        }
        window.list.save();
        checkMeasurementUnitAndSetDisplay();
    });
    window.addEvent('measurementListDoneValidation', function() {
        var progressList = $$('.progress-item');
        $('progress-bar').getElements('.tooltip').destroy();
        progressList.forEach(function(progressItem) {
            var id = progressItem.getProperty('data-id');
            progressItem.removeClass('valid').removeClass('warning').removeClass('error');
            if (window.list.measurement(id).valid != undefined) {
                progressItem.addClass(window.list.measurement(id).valid);
            }
        });
        $('measurement-input').removeClass('valid').removeClass('warning').removeClass('error');
        if (document.getElement('.progress-item.active').hasClass('valid')) {
            $('measurement-input').addClass('valid');
            $('tooltip').addClass('hide');
        }
        if (document.getElement('.progress-item.active').hasClass('warning')) {
            $('measurement-input').addClass('warning');
            var progressItem = document.getElement('.progress-item.active');
            var measurement = window.list.measurement(progressItem.getProperty('data-id'));
            $('tooltip').setProperty('html', measurement.validMessage);
            $('tooltip').removeClass('hide');
        }
        if (document.getElement('.progress-item.active').hasClass('error')) {
            $('measurement-input').addClass('error');
            var progressItem = document.getElement('.progress-item.active');
            var measurement = window.list.measurement(progressItem.getProperty('data-id'));
            $('tooltip').setProperty('html', measurement.validMessage);
            $('tooltip').removeClass('hide');
        }
    });
    window.addEvent('resize:pause(500)', refreshUI);
    window.addEvent('progressBarPopulated', function() {
        if (!window.progressScroll) {
            setTimeout(function() {
                window.progressScroll = new IScroll('#progress-bar', {
                    mouseWheel: true,
                    click: false,
                    tap: true,
                    scrollbars: false,
                    scrollX: true,
                    scrollY: false
                });
            }, 100);
        }
    });
    window.addEvent('unsavedProfileExists', function(event) {
        window.list.reset();
    });
    window.addEvent('resetMeasurements', resetUI);
    window.addEvent('keydown', function(ev) {
        if (ev.code == 39) nextMeasurement();
        if (ev.code == 37) previousMeasurement();
    });
    $('measurement-value').addEvent('keyup:pause(1000)', function(event) {
        event.stopPropagation();
        window.list.parameters.hasEditedValue = true;
        userSaveMeasurement(this);
    });
    $('measurement-value').addEvent('keydown', function(event) {
        event.stopPropagation();
        if (event.code == 13) {
            event.stopPropagation();
            window.list.parameters.hasEditedValue = true;
            userSaveMeasurement(this, function() {
                nextMeasurement();
            });
        }
    });
    $('measurement-value').addEvent('blur', function(event) {
        event.stopPropagation();
        window.list.parameters.hasEditedValue = true;
        userSaveMeasurement(this);
    });
    $('measurement-value').addEvent('focus', function(event) {
        if (this.getProperty('value') == '0') {
            this.setProperty('value', '');
        }
    });
    $('measurements').addEvent('click', function() {
        $('measurement-input').addClass('hide');
    });
    $('inputs').addEvent('click', function() {
        $('measurement-input').addClass('hide');
    });
    $('measurement-input').addEvent('click', function(ev) {
        ev.stopPropagation();
    });
    $('hideInstructions').addEvent('click', function(event) {
        $('measurement-input').addClass('hide');
    });
    $$('.navArrow.left').addEvent('click', function(event) {
        event.preventDefault();
        previousMeasurement();
    });
    $$('.navArrow.right').addEvent('click', function(event) {
        event.preventDefault();
        nextMeasurement();
    });
    $('resetButton').addEvent('click', resetButtonHandler);
    if ($('measurement-profile-height-metric')) $('measurement-profile-height-metric').addEvent('keydown', function(event) {
        if (event.code <= 48) {
            event.stopPropagation();
        } else if (event.code > 57 && !(event.code >= 96 && event.code <= 105))
            return false;
        if (event.code == 13) {
            event.preventDefault();
            $('measurement-profile-weight').focus();
        }
    });
    if ($('measurement-profile-weight')) $('measurement-profile-weight').addEvent('keydown', function(event) {
        if (event.code <= 48) {
            event.stopPropagation();
        } else if (event.code > 57 && !(event.code >= 96 && event.code <= 105))
            return false;
    });
    $('saveProfileButton').addEvent('click', storeMeasurements);
    $('saveAsProfileButton').addEvent('click', storeMeasurements);
    if ($('sizeMeMetricHeight')) {
        $('sizeMeMetricHeight').addEvent('change', calculateNeckMeasurement);
        $('sizeMeMetricHeight').addEvent('keydown', function(event) {
            if (event.code <= 48) {
                event.stopPropagation();
            } else if (event.code > 57 && !(event.code >= 96 && event.code <= 105))
                return false;
            if (event.code == 13)
                $('sizeMeMetricWeight').focus();
        });
        $('sizeMeMetricHeight').addEvent('keyup', function(event) {
            if (event.code <= 48) {
                return;
            }
            if (window.list.parameters.unit == 'cm' && $('sizeMeMetricHeight').get('value').length == 3)
                $('sizeMeMetricWeight').focus();
        });
        $('sizeMeMetricWeight').addEvent('change', calculateNeckMeasurement);
        $('sizeMeMetricWeight').addEvent('keydown', function(event) {
            if (event.code <= 48) {
                event.stopPropagation();
            } else if (event.code > 57 && !(event.code >= 96 && event.code <= 105))
                return false;
            if (event.code == 13) {
                $('sizeMeMetricNeck').focus();
                event.stop();
            }
        });
        $('sizeMeMetricNeck').addEvent('keydown', function(event) {
            if (event.code <= 48) {
                event.stopPropagation();
            }
        });
        $('sizeMeMetricWeight').addEvent('keyup', function(event) {
            if (event.code <= 48) {
                return;
            }
            if (window.list.parameters.unit == 'cm') {
                var weight = $('sizeMeMetricWeight').get('value');
                if (weight.length == 3 || (weight.length == 2 && parseInt(weight.charAt(0)) > 2)) {
                    $('sizeMeMetricNeck').focus();
                    calculateNeckMeasurement();
                }
            }
        });
    }
    if ($('sizeMeImperialHeight')) {
        $('sizeMeImperialHeight').addEvent('change', calculateNeckMeasurement);
        $('sizeMeMetricWeight').addEvent('change', calculateNeckMeasurement);
        $('sizeMeMetricWeight').addEvent('keydown', function(event) {
            if (event.code == 13) {
                $('sizeMeMetricNeck').focus();
                event.stop();
            }
        });
    }
    $('sizeMeSubmit').addEvent('click', function(event) {
        event.preventDefault();
        var heightStr = "";
        if ($('sizeMeMetricHeight').getProperty('value').indexOf('.') == 1) {
            heightStr = $('sizeMeMetricHeight').getProperty('value').replace('.', '');
        } else {
            heightStr = $('sizeMeMetricHeight').getProperty('value').replace(',', '.');
        }
        var neck = $('sizeMeMetricNeck').getProperty('value').replace(',', '.').toFloat();
        var height = heightStr.toFloat();
        var weight = $('sizeMeMetricWeight').getProperty('value').replace(',', '.').toFloat();
        if (window.list.parameters.unit == 'in') {
            height = $('sizeMeImperialHeight').getSelected()[0].get('value').toFloat();
        }
        if (!height > 0 ||  !weight > 0) {
            return;
        }
        if (window.list.parameters.hasEditedValue) {
            if (!confirm(jsLang['OVERWRITE_WARNING'])) {
                return false;
            }
        }
        if (!neck > 0 && $('sizeMeMetricNeck').getProperty('placeholder'))
            neck = $('sizeMeMetricNeck').getProperty('placeholder').replace(',', '.').toFloat();
        if (window.list.parameters.unit == 'in') {
            neck = inchToCm(neck);
            weight = lbsToKg(weight);
        }
        window.list.add(new Measurement("SPEEDY_HEIGHT"));
        window.list.add(new Measurement("SPEEDY_WEIGHT"));
        window.list.add(new Measurement("SPEEDY_COLLAR"));
        if (!window.list.measurement("WEIGHT")) {
            window.list.add(new Measurement("WEIGHT"));
        }
        if (!window.list.measurement("BODY_HEIGHT")) {
            window.list.add(new Measurement("BODY_HEIGHT"));
        }
        window.list.measurement("WEIGHT").value = weight;
        window.list.measurement("BODY_HEIGHT").value = height;
        window.list.measurement("MEAS_NECK").value = neck;
        window.list.measurement("SPEEDY_HEIGHT").value = height;
        window.list.measurement("SPEEDY_WEIGHT").value = weight;
        window.list.measurement("SPEEDY_COLLAR").value = neck;
        window.list.parameters.doSizeMe = false;
        window.list.parameters.isSizeMe = true;
        window.list.parameters.sizeMeGeneratedTime = parseInt(new Date().getTime() / 1000);
        window.list.parameters.lastUpdated = window.list.parameters.sizeMeGeneratedTime;
        window.list.parameters.lastUpdatedOriginal = window.list.parameters.lastUpdated;
        window.list.getSizeMeData();
        window.list.save();
        $('measurement-input').removeClass('hide');
        $('storeMeasurementsButton').addClass('trustyButton');
        $('storeMeasurementsButton').removeProperty('disabled');
        $('storeMeasurementsButton').addEvent('click', showNameProfileModal);
        $('progressSaveButton').addClass('activated');
        $('progressSaveButton').addEvent(clickEventType, showNameProfileModal);
        showMeasurement();
    });
    $('sizeMeClose').addEvent('click', function(event) {
        event.preventDefault();
        closeModal();
        $('measurement-input').removeClass('hide');
        $('measurement-value').focus();
    });
    $('beginButton').addEvent('click', function(event) {
        event.preventDefault();
        closeModal();
    });
    if ($('customer_customer_details')) {
        $('customer_customer').addEvent('change', function(event) {
            $('customer_customer_details').setStyle('visibility', $('customer_customer').value == 'new_customer' ? 'visible' : 'hidden')
        });
    }
    if ($('measurement-profile-weight')) {
        $('measurement-profile-weight').addEvent('change', function() {
            simpleSaveMeasurement('WEIGHT', this.get('value'));
        });
        $('measurement-profile-height-metric').addEvent('change', function() {
            simpleSaveMeasurement('BODY_HEIGHT', this.get('value'));
        });
        $('measurement-profile-height-imperial').addEvent('change', function() {
            simpleSaveMeasurement('BODY_HEIGHT', this.get('value'), true);
        });
    }
    window.list = new MeasurementList();
    window.list.initialize();
    checkMeasurementUnitAndSetDisplay();
    if (window.list.parameters.doSizeMe) {
        showSizeMeForm();
    } else {
        if (!window.list.hasLocalList() && window.list.parameters.update == 0)
            showWelcomeSplash();
    }
    refreshUI();

    function simpleSaveMeasurement(measID, value, alreadyInCm) {
        var alreadyInCm = typeof alreadyInCm !== 'undefined' ? alreadyInCm : false;
        if (typeof value == 'string') {
            if (value == '')
                value = 0;
            else
                value = parseFloat(value.replace(',', '.'));
        } else if (value === null) {
            value = 0;
        }
        if (window.list.parameters.unit === 'in' && !alreadyInCm) {
            if (measID == 'BODY_HEIGHT') {
                value = inchToCm(feetToInch(value));
            } else if (measID == 'WEIGHT') {
                value = lbsToKg(value);
            } else {
                value = inchToCm(value);
            }
        }
        window.list.parameters.lastUpdated = parseInt(new Date().getTime() / 1000);
        window.list.measurement(measID).value = value;
        window.list.save();
    }

    function userSaveMeasurement(elem, callbackOnSuccess) {
        var measID = document.getElement('#measurements li.active').getProperty('data-id');
        var value = elem.getProperty('value');
        if (window.list.measurement(measID).value != value) {
            simpleSaveMeasurement(measID, value);
            window.list.validate(measID, callbackOnSuccess);
        } else {
            if (typeof callbackOnSuccess !== 'undefined')
                callbackOnSuccess();
        }
        if ((window.list.allMeasurementsHaveValues() && window.list.hasNoErrors()) || window.list.parameters.product_type == "0") {
            $('storeMeasurementsButton').addClass('trustyButton');
            $('storeMeasurementsButton').removeProperty('disabled');
            $('storeMeasurementsButton').addEvent('click', showNameProfileModal);
            $('progressSaveButton').addClass('activated');
            $('progressSaveButton').addEvent(clickEventType, showNameProfileModal);
        } else {
            $('storeMeasurementsButton').removeEvent('click', showNameProfileModal);
            $('storeMeasurementsButton').setProperty('disabled');
            $('storeMeasurementsButton').removeClass('trustyButton');
            $('progressSaveButton').removeClass('activated');
            $('progressSaveButton').removeEvent('click');
        }
    }

    function checkMeasurementUnitAndSetDisplay() {
        if (window.list.parameters.unit == "cm") {
            $$('.unitlength').setProperty('html', 'cm');
            $$('.unitweight').setProperty('html', 'kg');
            $$('.row.imperial.length').addClass('hidden');
            $$('.row.metric.length').removeClass('hidden');
            $$('.toggle-switch #metric').set('checked', true);
        } else {
            $$('.unitlength').setProperty('html', 'in');
            $$('.unitweight').setProperty('html', 'lbs');
            $$('.row.metric.length').addClass('hidden');
            $$('.row.imperial.length').removeClass('hidden');
            $$('.toggle-switch #imperial').set('checked', true);
        }
    }

    function hasVideo() {
        var currentID = document.getElement('#measurements li.active').getProperty('data-id');
        return (typeof window.list.measurement(currentID).video[window.list.parameters.gender] != 'undefined');
    }

    function showVideoModal() {
        var currentID = document.getElement('#measurements li.active').getProperty('data-id');
        var descriptionContent = new Element('div.description');
        var videoContainer = new Element('div.embedContainer');
        videoContainer.setStyle('padding-bottom', '59,25%;');
        var video = new Element('iframe');
        video.setProperty('frameborder', '0');
        if (window.list.parameters.gender == 'male') {
            video.setProperty('src', '//www.youtube.com/embed/' + window.list.measurement(currentID).video.male + '?rel=0&showinfo=0');
        } else {
            video.setProperty('src', '//www.youtube.com/embed/' + window.list.measurement(currentID).video.female + '?rel=0&showinfo=0');
        }
        videoContainer.adopt(video);
        descriptionContent.adopt(videoContainer);
        modal({
            content: descriptionContent.getProperty('html')
        });
    }

    function populateMeasurementList() {
        $$('#measurements .list li').destroy();
        var imageList = document.getElement('#measurements .list');
        var gotoMeas = null;
        Array.each(window.list.getMeasurements(), function(measurement, index) {
            if (measurement.required) {
                var imageListItem = new Element('li');
                imageListItem.setProperty('data-id', measurement.id);
                imageListItem.setProperty('html', "&nbsp;");
                imageList.grab(imageListItem);
                if (measurement.value == 0 && gotoMeas == null && startMeas == null) {
                    gotoMeas = imageListItem;
                }
            }
        });
        showMeasurement(gotoMeas);
    }

    function populateProgressBar() {
        var progressBar = $$('#progress-bar ul');
        $$('#progress-bar ul li').destroy();
        if (showSizeMeButton()) {
            var sizeMeButton = new Element('li');
            var sizeMeLogo = new Element('img', {
                'src': '//cdn1.tailorstore.com/ui/gefjun/icons/quicksize-white.svg'
            });
            var divider = new Element('li.divider');
            sizeMeButton.grab(sizeMeLogo);
            sizeMeButton.setProperty('id', 'activateSizeMe');
            sizeMeButton.addEvent(clickEventType, showSizeMeForm);
            progressBar.grab(sizeMeButton);
            progressBar.grab(divider);
        }
        Array.each(window.list.getMeasurements(), function(measurement, index) {
            if (measurement.required) {
                var progressItem = new Element('li.progress-item');
                var progressText = new Element('span.name');
                var progressImage = new Element('img');
                var progressMod = new Element('div.mod');
                if (window.list.parameters.template == "s") {
                    progressImage.setProperty('src', measurement.icon.shirt);
                } else {
                    if (window.list.parameters.gender == "male") {
                        progressImage.setProperty('src', measurement.icon.male);
                    }
                    if (window.list.parameters.gender == "female") {
                        progressImage.setProperty('src', measurement.icon.female);
                    }
                }
                var label = measurement.label;
                if (typeof measurement.label == 'object') {
                    label = measurement.label[getMeasType()];
                }
                progressText.setProperty('html', label);
                progressItem.setProperty('data-id', measurement.id);
                progressItem.grab(progressText);
                progressItem.grab(progressImage);
                progressItem.grab(progressMod);
                if (measurement.value != "" && measurement.value != undefined) {
                    progressItem.toggleClass('valid');
                }
                progressItem.addEvent(clickEventType, progressBarItemClickHandler);
                progressBar.grab(progressItem);
            }
        });
        var divider = new Element('li.divider');
        var progressSave = new Element('li#progressSaveButton');
        var progressSaveText = new Element('span.name');
        var okIcon = new Element('span.el-icon-ok');
        var progressReset = new Element('li#progressResetButton');
        var progressResetText = new Element('span.name');
        var resetIcon = new Element('span.el-icon-trash');
        progressSaveText.set('html', jsLang['S_SAVE']);
        progressSave.grab(progressSaveText);
        progressSave.grab(okIcon);
        progressBar.grab(divider);
        progressResetText.set('html', jsLang['RESET_PROFILE']);
        progressReset.grab(progressResetText);
        progressReset.grab(resetIcon);
        progressBar.grab(progressSave);
        progressReset.addEvent(clickEventType, resetButtonHandler);
        progressBar.grab(progressReset);
        var firstItem = progressBar.getFirst('.progress-item');
        firstItem.toggleClass('active');
        window.fireEvent('progressBarPopulated');
        window.list.validate();
        refreshUI();
        setProgressBarToCurrentItem();
    }

    function showSizeMeButton() {
        if (window.list.parameters.gender == "male" && window.list.parameters.template == "b" && (window.list.parameters.product_type == 26 || window.list.parameters.product_type == 0 || window.list.parameters.product_type == 33)) {
            return true;
        }
        if (window.list.parameters.doSizeMe && (window.list.parameters.product_type == 26 || window.list.parameters.product_type == 0 || window.list.parameters.product_type == 33)) {
            return true;
        }
        return false;
    }

    function progressBarItemClickHandler(event) {
        event.preventDefault();
        var targetId = this.getProperty('data-id');
        var targetMeasurement = document.getElement('#measurements .list li[data-id="' + targetId + '"]');
        setTimeout(function() {
            canClick[targetId] = true;
        }, 1000);
        if (typeof canClick[targetId] == 'undefined' || canClick[targetId] == true) {
            canClick[targetId] = false;
            userSaveMeasurement($('measurement-value'));
            $$('.progress-item').removeClass('active');
            this.addClass('active');
            window.progressScroll.scrollToElement(this, 250, true);
            showMeasurement(targetMeasurement);
        }
    }

    function setProgressBarToCurrentItem() {
        var currentMeasItem = document.getElement('#measurements .active');
        var currentMeasID = currentMeasItem.getProperty('data-id');
        var currentProgressItem = document.getElement('.progress-item.active');
        var nextProgressItem = document.getElement('.progress-item[data-id="' + currentMeasID + '"]');
        currentProgressItem.toggleClass('active');
        nextProgressItem.toggleClass('active');
        if (typeof window.progressScroll !== 'undefined')
            window.progressScroll.scrollToElement(nextProgressItem, 250, true);
    }

    function resetButtonHandler(event) {
        event.preventDefault();
        if (confirm(jsLang['CONFIRM_RESET'])) {
            window.list.reset();
        }
    }

    function resetUI() {
        $$('.progress-item').removeClass('valid').removeClass('warning');
        $$('.progress-item .el-icon-ok').destroy();
        $$('.progress-item .el-icon-warning-sign').destroy();
        $('measurement-input').removeClass('valid').removeClass('warning').setProperty('value', "0");
        if (window.list.parameters.returnUrl != undefined) {
            window.location.href = window.list.parameters.returnUrl;
        } else {
            window.location.reload();
        }
    }

    function nextMeasurement() {
        var current = document.getElement('#measurements li.active');
        var next = current.getNext('li');
        if (next == null) {
            next = current.getParent().getFirst('li');
        }
        showMeasurement(next);
        setProgressBarToCurrentItem();
    }

    function previousMeasurement() {
        var current = document.getElement('#measurements li.active');
        var previous = current.getPrevious('li');
        if (previous == null) {
            previous = current.getParent().getLast('li');
        }
        showMeasurement(previous);
        setProgressBarToCurrentItem();
    }

    function getMeasType() {
        var measType = window.list.parameters.template == 'b' ? 'body' : 'shirt';
        if (measType == 'body') {
            measType = window.list.parameters.gender;
        }
        return measType;
    }

    function showMeasurement(listItem) {
        if (listItem == undefined || listItem == null) {
            var listItem = document.getElements('.list').getFirst();
        }
        var measID = listItem.getProperty('data-id').toString();
        var value = 0;
        var measurement = window.list.measurement(measID);
        var currentMeasItem = document.getElement('#measurements .active');
        if (currentMeasItem) {
            var currentMeasID = currentMeasItem.getProperty('data-id');
            var targetId = listItem.getProperty('data-id');
            if (currentMeasID == targetId) {
                $('measurement-input').toggleClass('hide');
            } else {
                $('measurement-input').removeClass('hide');
            }
        }
        if (window.list.parameters.gender == 'male' && window.list.parameters.template == 'b') {
            listItem.setStyle('background-image', 'url("' + measurement.image.male + '")');
        } else {
            listItem.setStyle('background-image', 'url("' + measurement.image.female + '")');
        }
        if (window.list.parameters.template == 's') {
            listItem.setStyle('background-image', 'url("' + measurement.image.shirt + '")');
        }
        if (document.getElement('#measurements li.active')) {
            document.getElement('#measurements li.active').toggleClass('active');
        }
        listItem.toggleClass('active');
        if (typeof measurement.label == 'object') {
            $$('#tip h3').set('text', measurement.label[getMeasType()]);
        } else {
            $$('#tip h3').set('text', measurement.label);
        }
        $$('#tip p').set('html', measurement.description[getMeasType()]);
        if (hasVideo() && $("measurements").getProperty('data-template') != 's') {
            $('videoLink').removeClass('hide').addEvent('click', showVideoModal);
        } else {
            $('videoLink').addClass('hide');
        }
        $('measurement-input').removeClass('hideInstructions');
        if ((measurement.value == undefined || measurement.value == "") && measurement.expected != undefined) {
            value = measurement.expected;
            $('measurement-value').addClass('expected');
        } else if (measurement.value != undefined && measurement.value != "") {
            value = measurement.value;
            $('measurement-value').removeClass('expected');
        } else {
            value = "0";
            $('measurement-value').removeClass('expected');
        }
        if (window.list.parameters.unit == 'in') {
            value = cmToInch(value);
        }
        if (parseFloat(value) != 0) {
            $('measurement-value').setProperty('value', value);
        } else {
            $('measurement-value').setProperty('value', '');
        }
        $('measurement-input').removeClass('warning').removeClass('valid').removeClass('error');
        $('tooltip').addClass('hide');
        if (measurement.valid == 'warning') {
            $('measurement-input').addClass('warning');
            $('tooltip').setProperty('html', measurement.validMessage);
            $('tooltip').removeClass('hide');
        }
        if (measurement.valid == 'error') {
            $('measurement-input').addClass('error');
            $('tooltip').setProperty('html', measurement.validMessage);
            $('tooltip').removeClass('hide');
        }
        if (measurement.valid == 'valid') {
            $('measurement-input').addClass('valid');
        }
        $('measurement-value').setProperty('min', measurement.min);
        $('measurement-value').setProperty('max', measurement.max);
    }

    function is_last_measurement(index) {
        var is_last_meas = true;
        for (var measID in window.list) {
            var meas = window.list[measID];
            if (meas != window.list[index]) {
                if (meas.value == "" || meas.value == undefined) {
                    is_last_meas = false;
                }
            }
        }
        return is_last_meas;
    }

    function storeMeasurements(event) {
        if (event != undefined) {
            event.preventDefault();
            window.list.parameters.name = $('measurement-profile-name').getProperty('value');
        }
        window.list.parameters.saveAs = this.getProperty('id') == 'saveAsProfileButton';
        window.list.parameters.customer = null;
        if ($('customer_customer')) {
            window.list.parameters.customer = new Object();
            if ($('customer_customer').value == 'new_customer') {
                window.list.parameters.customer['first_name'] = $('customer_first_name').value;
                window.list.parameters.customer['last_name'] = $('customer_last_name').value;
                window.list.parameters.customer['email'] = $('customer_email').value;
                window.list.parameters.customer['phone'] = $('customer_phone') ? $('customer_phone').value : '';
            } else if ($('customer_customer').value > 0) {
                window.list.parameters.customer['customer_id'] = $('customer_customer').value;
            }
        }
        window.list.storeMeasurements();
    }

    function showNameProfileModal(event) {
        event.preventDefault();
        var saveModal = $('saveModal');
        if (window.list.parameters.profileName.length > 0) {
            var profile_name = window.list.parameters.profileName;
            if ($('measurements').getProperty('data-is-standard-meas') == '1')
                profile_name += " " + jsLang['CUSTOMIZED'];
            saveModal.getElement('#measurement-profile-name').set('value', profile_name);
        }
        if (window.list.parameters.update != 0) {
            saveModal.getElement('#saveProfileButton').set('text', jsLang['S_UPDATE_MEAS_PROFILE']);
            saveModal.getElement('#saveAsProfileButton').setStyle('display', 'block');
        } else {
            saveModal.getElement('#saveAsProfileButton').setStyle('display', 'none');
        }
        if (window.list.measurement("WEIGHT").value > 0 && saveModal.getElement('#measurement-profile-weight') != undefined) {
            if (window.list.parameters.unit == "cm")
                saveModal.getElement('#measurement-profile-weight').set('value', window.list.measurement("WEIGHT").value);
            else
                saveModal.getElement('#measurement-profile-weight').set('value', kgToLbs(window.list.measurement("WEIGHT").value));
        }
        if (window.list.measurement("BODY_HEIGHT").value > 0 && saveModal.getElement('#measurement-profile-height-metric') != undefined) {
            if (window.list.parameters.unit == "cm")
                saveModal.getElement('#measurement-profile-height-metric').set('value', window.list.measurement("BODY_HEIGHT").value);
            else
                saveModal.getElement('#measurement-profile-height-imperial').set('value', window.list.measurement("BODY_HEIGHT").value);
        }
        modal({
            'grab': saveModal
        });
        saveModal.getElement('#measurement-profile-name').focus();
    }

    function showSizeMeForm() {
        modal({
            'grab': $('sizeMeForm')
        });
        if ($('sizeMeMetricHeight') && !isMobile()) {
            $('measurement-input').addClass('hide');
            $('sizeMeMetricHeight').focus();
        }
    }

    function showWelcomeSplash() {
        modal({
            'grab': $('welcomeSplash')
        });
    }

    function refreshUI() {
        cSize = $('measurements').getSize();
        var ratio = cSize.x / cSize.y;
        document.getElement('body').removeClass('extreme').removeClass('landscape').removeClass('portrait');
        if (ratio >= 1) {
            document.getElement('body').addClass('landscape');
        } else {
            document.getElement('body').addClass('portrait');
        }
        if (ratio > 1.7 || ratio < 0.7) {
            document.getElement('body').addClass('extreme');
        }
        if (typeof window.progressScroll != 'undefined') window.progressScroll.refresh();
    }

    function isMobile() {
        cSize = $('measurements').getSize();
        return cSize.x < 768;
    }

    function calculateNeckMeasurement() {
        if (($('sizeMeMetricHeight') || $('sizeMeImperialHeight')) && $('sizeMeMetricWeight')) {
            var neck = parseFloat($('sizeMeMetricNeck').get('value'));
            if (window.list.parameters.unit == 'in') {
                var height = parseFloat($('sizeMeImperialHeight').getSelected()[0].get('value'));
                var weight = parseFloat(lbsToKg($('sizeMeMetricWeight').get('value')));
            } else {
                var heightStr = "";
                if ($('sizeMeMetricHeight').get('value').indexOf('.') == 1) {
                    heightStr = $('sizeMeMetricHeight').get('value').replace('.', '');
                } else {
                    heightStr = $('sizeMeMetricHeight').get('value');
                }
                var height = parseFloat(heightStr);
                var weight = parseFloat($('sizeMeMetricWeight').get('value'));
            }
            if (height > 0 && weight > 0) {
                var measList = {};
                var url = new URI(document.URL).parsed;
                measList["MEAS_UNIT"] = 'cm';
                measList["WEIGHT"] = weight;
                measList["BODY_HEIGHT"] = height;
                new Request.JSON({
                    url: window.ajaj + '/measurements/verify/',
                    onSuccess: function(response) {
                        if (response.MEAS_NECK) {
                            if (window.list.parameters.unit == "in") {
                                $('sizeMeMetricNeck').set('placeholder', cmToInch(response.MEAS_NECK.exp));
                            } else {
                                $('sizeMeMetricNeck').set('placeholder', response.MEAS_NECK.exp);
                            }
                            if (!neck > 0) {
                                if (window.list.parameters.unit == "in") {
                                    $('sizeMeCollarInfo').set('html', jsLang['IF_YOU_DONT_KNOW_YOUR_NECK_SIZE'].replace('%collarsize%', cmToInch(response.MEAS_NECK.exp) + ' in'));
                                } else {
                                    $('sizeMeCollarInfo').set('html', jsLang['IF_YOU_DONT_KNOW_YOUR_NECK_SIZE'].replace('%collarsize%', response.MEAS_NECK.exp + ' cm'));
                                }
                            } else {
                                $('sizeMeCollarInfo').set('html', '');
                            }
                        }
                    }
                }).post(JSON.encode(measList));
            }
        }
    }
});

function feetToInch(value) {
    return Number(value) * 12;
}

function inchToCm(value) {
    return Number(value) * 2.54;
}

function cmToInch(value) {
    return (Number(value) * 0.393700787).toFixed(1);
}

function lbsToKg(value) {
    return Math.round(Number(value) * 0.45359237);
}

function kgToLbs(value) {
    return Math.round(Number(value) * 2.20462262);
}
var Measurement = function(meas) {
    this.id = null;
    this.description = null;
    this.min = null;
    this.max = null;
    this.value = null;
    this.originalValue = 0;
    this.required = false;
    this.label = null;
    this.type = null;
    this.valid = null;
    this.validMessage = null;
    this.image = {};
    this.video = {};
    this.icon = null;
    if (meas != undefined && typeof meas === 'string') {
        this.id = meas;
    }
    if (meas != undefined && typeof meas === 'object') {
        this.id = meas.id;
        this.description = meas.description;
        this.min = meas.min;
        this.max = meas.max;
        this.required = meas.required;
        this.label = meas.label;
        this.type = meas.type;
        this.valid = meas.valid;
        this.validMessage = meas.validMessage;
        this.image = meas.image;
        this.video = meas.video;
        this.icon = meas.icon;
        meas.value != undefined ? this.value = meas.value : this.value = 0;
        meas.value != undefined ? this.originalValue = meas.value : this.originalValue = 0;
    }
}
var MeasurementList = function() {
    this.list = new Array();
    this.parameters = {
        "unit": "cm",
        "product_type": 26,
        "template": "b",
        "sex": "m",
        "profileName": "",
        "isSizeMe": false,
        "lastUpdated": parseInt(new Date().getTime() / 1000),
        "hasEditedValue": false
    };
    this.parameters.lastUpdatedOriginal = this.parameters.lastUpdated;
}
MeasurementList.prototype.initialize = function() {
    this.parameters["update"] = $('measurements').getProperty('data-update');
    this.parameters["unit"] = $('measurements').getProperty('data-unit');
    this.parameters["gender"] = $('measurements').getProperty('data-gender');
    this.parameters["template"] = $('measurements').getProperty('data-template');
    this.parameters["product_type"] = $('measurements').getProperty('data-producttype');
    this.parameters["item"] = $('measurements').getProperty('data-item');
    this.parameters["sex"] = this.parameters["gender"] == 'male' ? 'm' : 'f';
    this.getParametersFromStorage();
    if ($('measurements').getProperty('data-update') != this.parameters.update || $('measurements').getProperty('data-producttype') != this.parameters.product_type) {
        this.reset();
    }
    if (this.parameters.gender == 'male' && this.parameters.template == 'b' && (this.parameters.product_type == '26' || this.parameters.product_type == '0' || this.parameters.product_type == '33') && !this.hasLocalList()) {
        this.parameters.doSizeMe = true;
    } else {
        this.parameters.doSizeMe = false;
    }
    if (this.parameters.update != "0") {
        this.parameters.doSizeMe = false;
        this.getExistingMeasurementProfile();
    }
    if (this.parameters.update == "0" && this.hasLocalList()) {
        var productType = $('measurements').getProperty('data-producttype');
        var template = $('measurements').getProperty('data-template');
        if (productType != this.parameters.product_type || this.parameters.template != template) {
            if (this.parameters.finishCurrentProfile) {
                this.getListFromStorage();
                return true;
            } else {
                window.fireEvent('unsavedProfileExists');
                return false;
            }
        } else {
            this.getListFromStorage();
        }
    }
    if (this.parameters.update == "0" && !this.hasLocalList()) {
        this.getBaseMeasurementList();
    }
}
MeasurementList.prototype.add = function(mObj) {
    if (!this.measurement(mObj.id)) {
        this.list.push(mObj);
        return true;
    } else {
        return false;
    }
}
MeasurementList.prototype.save = function() {
    if (this.canUseLocalStorage()) {
        window.localStorage.setItem('measurementsList', JSON.encode(this.list));
        window.localStorage.setItem('measurementParams', JSON.encode(this.parameters));
    } else {
        var url = new URI(document.URL).parsed;
        var payload = {
            'measurementList': JSON.encode(this.list),
            'measurementParams': JSON.encode(this.parameters)
        }
        new Request.JSON({
            url: window.ajaj + '/measurements/saveToSession/',
            onSuccess: function(response) {
                window.fireEvent('measurmentsStoredToSession');
            }
        }).get(payload);
    }
}
MeasurementList.prototype.storeMeasurements = function() {
    var valuesAreChanged = false;
    if (this.parameters.lastUpdated) {
        Array.each(this.list, function(mObj, index) {
            if (mObj.originalValue != mObj.value) {
                valuesAreChanged = true;
            }
        });
    }
    if (!valuesAreChanged) {
        this.parameters.lastUpdated = this.parameters.lastUpdatedOriginal;
    }
    var measArray = [];
    Array.each(this.list, function(measurement, index) {
        if (measurement.value == undefined) {
            measurement.value = 0;
        }
        measArray.push({
            id: measurement.id,
            value: measurement.value
        });
    });
    var payload = {
        gender: this.parameters.gender,
        sex: this.parameters.sex,
        type: this.parameters.template,
        unit: this.parameters.unit,
        name: this.parameters.name,
        update: this.parameters.update,
        isSizeMe: this.parameters.isSizeMe,
        lastUpdated: parseInt(this.parameters.lastUpdated),
        customer: this.parameters.customer,
        saveAs: this.parameters.saveAs,
        item: this.parameters.item,
        measurements: measArray
    };
    if (this.parameters.isSizeMe) {
        payload.sizeMeGeneratedTime = parseInt(this.parameters.sizeMeGeneratedTime);
    }
    var url = new URI(document.URL).parsed;
    spinner.spin($('ui'));
    new Request.JSON({
        url: window.ajaj + '/measurements/saveMeasurementsToDB/',
        onSuccess: function(response) {
            spinner.stop();
            if (response.success) {
                closeModal();
                popMessage(response.message, 'infoMessage');
                if (window.localStorage.getItem('measurementsWaitingForSave')) {
                    window.localStorage.removeItem('measurementsWaitingForSave');
                }
                window.localStorage.removeItem('measurementParams');
                window.localStorage.removeItem('measurementsList');
                if ($('measurements').getProperty('data-returnurl') != "") {
                    var returnUrl = $('measurements').getProperty('data-returnurl');
                    if ($('measurements').getProperty('data-for')) {
                        returnUrl += "?for=" + $('measurements').getProperty('data-for');
                        returnUrl += "&profile=" + response.profileID;
                    }
                    if ($('measurements').getProperty('data-designer') != "") {
                        returnUrl += "&profile=" + response.profileID;
                    }
                    window.list.parameters.returnUrl = returnUrl;
                    $('measurement-input').addClass('hide');
                    window.list.reset();
                } else {
                    window.list.reset();
                }
            } else {
                popMessage(response.message, 'warningMessage');
                window.localStorage.setItem('measurementsWaitingForSave', '1');
                window.localStorage.setItem('measurementParams', JSON.encode(window.list.parameters));
            }
        },
        onError: function(text, error) {
            spinner.stop();
        },
        onFailure: function(xhr) {
            spinner.stop();
        }
    }).get({
        data: JSON.encode(payload)
    });
}
MeasurementList.prototype.validate = function(measID, callbackOnSuccess) {
    if ((this.parameters.template == "b" && this.parameters.gender == "male" && this.parameters.product_type == 26) || this.parameters.isSizeMe) {
        if (this.validateMeasurementsByMinMax(measID)) {
            this.validateMeasurementsWithService(measID, callbackOnSuccess);
        }
    } else {
        if (this.validateMeasurementsByMinMax(measID) && typeof callbackOnSuccess !== 'undefined')
            callbackOnSuccess();
    }
}
MeasurementList.prototype.validateMeasurementsWithService = function(currentMeasID, callbackOnSuccess) {
    var measList = {};
    var url = new URI(document.URL).parsed;
    var currentList = this;
    Array.each(this.list, function(mObj, index) {
        if (mObj.value != undefined && mObj.value != 0.00 && mObj.value != null) {
            measList[mObj.id] = Math.round(mObj.value, 1);
        }
    });
    measList["MEAS_UNIT"] = 'cm';
    measList["displayUnit"] = window.list.parameters.unit;
    if (this.measurement("WEIGHT") != undefined && this.measurement("WEIGHT") != 0) {
        measList["WEIGHT"] = this.measurement("WEIGHT").value;
    }
    if (this.measurement("BODY_HEIGHT") != undefined && this.measurement("BODY_HEIGHT").value != 0) {
        measList["BODY_HEIGHT"] = this.measurement("BODY_HEIGHT").value;
    }
    if (this.measurement("MEAS_NECK").value != undefined && this.measurement("MEAS_NECK").value != 0) {
        measList["MEAS_NECK"] = this.measurement("MEAS_NECK").value;
        this.measurement("MEAS_NECK").valid = "valid";
    }
    new Request.JSON({
        url: window.ajaj + '/measurements/verify/',
        onSuccess: function(response) {
            for (var measID in response) {
                if (currentList.measurement(measID)) {
                    if (response[measID].message != "") {
                        currentList.measurement(measID).valid = "warning";
                        currentList.measurement(measID).validMessage = response[measID].message;
                    }
                    if (response[measID].message == "" && currentList.measurement(measID).value != undefined && currentList.measurement(measID).value != null && currentList.measurement(measID).value != "0") {
                        currentList.measurement(measID).valid = "valid";
                        currentList.measurement(measID).validMessage = "";
                        if (measID == currentMeasID && typeof callbackOnSuccess !== 'undefined')
                            callbackOnSuccess();
                    }
                }
            }
            window.fireEvent("measurementListDoneValidation");
        }
    }).post(JSON.encode(measList));
}
MeasurementList.prototype.validateMeasurementsByMinMax = function(currentMeasID) {
    var validatedCurrent = false,
        hasError = false;
    Array.each(this.list, function(measurement, index) {
        measurement.valid = null;
        if (measurement.value && measurement.min && measurement.max) {
            if (measurement.value.toInt() >= measurement.min.toInt() && measurement.value.toInt() <= measurement.max.toInt()) {
                measurement.valid = "valid";
                if (measurement.id == currentMeasID)
                    validatedCurrent = true;
            } else {
                hasError = true;
                measurement.valid = "error";
                measurement.validMessage = jsLang['OUTOFBOUNDS_ERROR'];
            }
        }
    });
    window.fireEvent("measurementListDoneValidation");
    if (!currentMeasID) {
        return !hasError;
    }
    return validatedCurrent;
}
MeasurementList.prototype.getSizeMeData = function() {
    var measList = {};
    var url = new URI(document.URL).parsed;
    var currentList = this;
    Array.each(this.list, function(mObj, index) {
        if (mObj.id != "MEAS_NECK" && mObj.id != "BODY_HEIGHT" && mObj.id != "WEIGHT") {
            measList[mObj.id] = 0;
        }
    });
    measList["MEAS_UNIT"] = 'cm';
    if (typeof this.measurement("MEAS_NECK").value == 'undefined') {
        measList["MEAS_NECK"] = 0;
    } else {
        measList["MEAS_NECK"] = this.measurement("MEAS_NECK").value.toInt();
    }
    if (this.measurement("WEIGHT") != '0') {
        measList["WEIGHT"] = this.measurement("WEIGHT").value.toInt();
    }
    if (this.measurement("BODY_HEIGHT").value != '0') {
        measList["BODY_HEIGHT"] = this.measurement("BODY_HEIGHT").value.toInt();
    }
    spinner.spin($('ui'));
    new Request.JSON({
        url: window.ajaj + '/measurements/verify/',
        onSuccess: function(response) {
            spinner.stop();
            if (Object.keys(response).length <= 3) {
                window.fireEvent("sizeMeDataFailed");
            } else if (typeof response.MEAS_CHEST !== 'undefined' && Object.keys(response.MEAS_CHEST.based_on).length == 1) {
                window.fireEvent("sizeMeDataFailed");
            } else {
                popMessage(jsLang['YOUR_MEASUREMENTS_ARE_CALCULATED'] + '<br />' + jsLang['PERFECT_FIT_NOTICE'], 'confirmMessage', function() {});
                for (var measID in response) {
                    if (measID != "WEIGHT" && measID != "BODY_HEIGHT" && currentList.measurement(measID) != undefined) {
                        currentList.measurement(measID).value = response[measID].exp;
                    }
                }
                Array.each(currentList.list, function(measObj) {
                    measObj.originalValue = measObj.value;
                });
                currentList.save();
                currentList.validate();
                window.fireEvent("sizeMeDataLoaded");
            }
        },
        onFailure: function(response) {}
    }).post(JSON.encode(measList));
}
MeasurementList.prototype.reset = function() {
    if (this.list) {
        this.list.length = 0;
    }
    if (this.canUseLocalStorage()) {
        window.localStorage.removeItem('measurementParams');
        window.localStorage.removeItem('measurementsList');
        window.fireEvent('resetMeasurements');
    } else {
        var url = new URI(document.URL).parsed;
        new Request.JSON({
            url: window.ajaj + '/measurements/resetStoredListInSession/',
            onSuccess: function(response) {
                window.fireEvent('resetMeasurements');
            }
        }).get();
    }
}
MeasurementList.prototype.getExistingMeasurementProfile = function() {
    var url = new URI(document.URL).parsed;
    var payload = {
        profileID: this.parameters.update.toInt()
    }
    if (this.parameters.product_type != "0") {
        payload.productType = this.parameters.product_type;
    }
    new Request.JSON({
        url: window.ajaj + '/measurements/getExistingMeasurementProfile/',
        onSuccess: function(response) {
            var list = window.list.list;
            var parameters = window.list.parameters;
            var noValueMeasurements = new Array();
            Array.each(response.measurements, function(mObj, index) {
                if (mObj.id != "WEIGHT" && mObj.id != "BODY_HEIGHT") {
                    mObj.required = true;
                    mObj.originalValue = mObj.value;
                    if (mObj.value === null || mObj.value == "0.00") {
                        noValueMeasurements.push(new Measurement(mObj));
                    } else {
                        list.push(new Measurement(mObj));
                    }
                }
            });
            Array.prototype.push.apply(list, noValueMeasurements);
            var height = new Measurement("BODY_HEIGHT");
            height.value = response.BODY_HEIGHT;
            var weight = new Measurement("WEIGHT");
            weight.value = response.WEIGHT;
            list.push(height);
            list.push(weight);
            parameters.profileName = response.profileName;
            parameters.sex = response.profileSex;
            parameters.template = response.profileTemplate;
            parameters.hasEditedValue = true;
            parameters.lastUpdated = response.lastUpdated;
            parameters.lastUpdatedOriginal = response.lastUpdated;
            window.list.parameters.unit = response.unit;
            if (response.speedyHeight != undefined) {
                if (response.unit == 'cm') {
                    $("sizeMeMetricHeight").setProperty('value', response.speedyHeight);
                    $("sizeMeMetricWeight").setProperty('value', response.speedyWeight);
                    $("sizeMeMetricNeck").setProperty('value', response.speedyCollar);
                } else {
                    $("sizeMeImperialHeight").setProperty('value', response.speedyHeight);
                    $("sizeMeMetricWeight").setProperty('value', kgToLbs(response.speedyWeight));
                    $("sizeMeMetricNeck").setProperty('value', cmToInch(response.speedyCollar));
                }
                parameters.doSizeMe = true;
            }
            parameters.sex == 'm' ? parameters.gender = "male" : parameters.gender = "female";
            window.fireEvent('measurementListReady');
        },
        onFailure: function(response) {},
        onError: function(response) {}
    }).get(payload);
}
MeasurementList.prototype.canUseLocalStorage = function() {
    if (window.localStorage) {
        var hasLocalStorage = true;
        try {
            window.localStorage.setItem("localStorageWriteTest", "1");
            hasLocalStorage = true;
        } catch (exeption) {
            hasLocalStorage = false;
        }
        return hasLocalStorage;
    } else {
        return false;
    }
}
MeasurementList.prototype.hasLocalList = function() {
    if (this.canUseLocalStorage()) {
        if (window.localStorage.getItem('measurementsList')) {
            return true;
        }
    }
    if (!this.canUseLocalStorage()) {
        var url = new URI(document.URL).parsed;
        var hasSessionList = false;
        new Request.JSON({
            url: window.ajaj + '/measurements/listStoredInSession/',
            async: false,
            onSuccess: function(response) {
                if (response.success == 1) {
                    hasSessionList = true;
                } else {
                    hasSessionList = false;
                }
            }
        }).get();
        return hasSessionList;
    }
    return false;
}
MeasurementList.prototype.getBaseMeasurementList = function() {
    var url = new URI(document.URL).parsed;
    var measurements = this.list;
    var params = {
        "product_type": this.parameters.product_type,
        "template": this.parameters.template
    }
    if (this.parameters.gender == "male") {
        params["gender"] = "m";
    } else {
        params["gender"] = "f";
    }
    var list = this.list;
    var ref = this;
    new Request.JSON({
        url: window.ajaj + '/measurements/getMeasurementList/',
        onSuccess: function(response) {
            Array.each(response, function(mObj, index) {
                var measurement = new Measurement(mObj);
                measurement.required = true;
                list.push(measurement);
            });
            var height = new Measurement();
            height.id = "BODY_HEIGHT";
            height.value = 0;
            var weight = new Measurement();
            weight.id = "WEIGHT"
            weight.value = 0;
            list.push(height);
            list.push(weight);
            window.fireEvent('measurementListReady');
        }
    }).get(params);
}
MeasurementList.prototype.getListFromStorage = function() {
    if (this.canUseLocalStorage()) {
        var storedList = JSON.decode(window.localStorage.getItem('measurementsList'));
        var list = this.list;
        Array.each(storedList, function(storedMeasObj, index) {
            list.push(new Measurement(storedMeasObj));
        });
        window.fireEvent('measurementListReady');
        return true;
    }
    if (!this.canUseLocalStorage()) {
        var url = new URI(document.URL).parsed;
        var list = this.list;
        var params = this.parameters;
        new Request.JSON({
            url: window.ajaj + '/measurements/getFromSession/',
            async: false,
            onSuccess: function(response) {
                Array.each(JSON.parse(response.measurementList), function(mObj, index) {
                    list.push(new Measurement(mObj));
                });
                params = JSON.parse(response.measurementParams);
            }
        }).get();
    }
    window.fireEvent('measurementListReady');
    return true;
}
MeasurementList.prototype.getParametersFromStorage = function() {
    if (this.canUseLocalStorage() && window.localStorage.getItem('measurementParams')) {
        this.parameters = JSON.decode(window.localStorage.getItem('measurementParams'));
    }
}
MeasurementList.prototype.getRequiredMeasurements = function() {
    var url = new URI(document.URL).parsed;
    var params = [];
    var measurements = this.list;
    params["product_type"] = this.parameters.product_type;
    params["template"] = this.parameters.template;
    params['gender'] = this.parameters.gender;
    new Request.JSON({
        url: window.ajaj + '/measurements/getRequiredMeasurements/',
        onSuccess: function(response) {
            Array.each(measurements, function(measurement, index) {
                measurement.required = response[measurement.id];
            });
            window.fireEvent('measurementListReady');
        }
    }).get(params);
};
MeasurementList.prototype.measurement = function(id) {
    if (id != undefined) {
        var meas = null;
        Array.each(this.list, function(measurement, index) {
            if (id == measurement.id) {
                meas = measurement;
            }
        });
    }
    return meas;
};
MeasurementList.prototype.getMeasurements = function() {
    return this.list;
};
MeasurementList.prototype.parameter = function(id) {
    if (id != undefined && this.parameters[id] != undefined) {
        return this.parameters[id];
    } else {
        return null;
    }
};
MeasurementList.prototype.allMeasurementsHaveValues = function() {
    var isComplete = true;
    Array.each(this.list, function(mObj, index) {
        if (mObj.id != "BODY_HEIGHT" && mObj.id != "WEIGHT" && (mObj.value == "0" || mObj.value == undefined || mObj.value == null)) {
            isComplete = false;
        }
    });
    return isComplete;
};
MeasurementList.prototype.hasNoErrors = function() {
    var errorStatus = true;
    Array.each(this.list, function(mObj, index) {
        if (mObj.valid == "error") {
            errorStatus = false;
        }
    });
    return errorStatus;
};
if (!window.localStorage) {
    Object.defineProperty(window, "localStorage", new(function() {
        var aKeys = [],
            oStorage = {};
        Object.defineProperty(oStorage, "getItem", {
            value: function(sKey) {
                return sKey ? this[sKey] : null;
            },
            writable: false,
            configurable: false,
            enumerable: false
        });
        Object.defineProperty(oStorage, "key", {
            value: function(nKeyId) {
                return aKeys[nKeyId];
            },
            writable: false,
            configurable: false,
            enumerable: false
        });
        Object.defineProperty(oStorage, "setItem", {
            value: function(sKey, sValue) {
                if (!sKey) {
                    return;
                }
                document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            },
            writable: false,
            configurable: false,
            enumerable: false
        });
        Object.defineProperty(oStorage, "length", {
            get: function() {
                return aKeys.length;
            },
            configurable: false,
            enumerable: false
        });
        Object.defineProperty(oStorage, "removeItem", {
            value: function(sKey) {
                if (!sKey) {
                    return;
                }
                document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            },
            writable: false,
            configurable: false,
            enumerable: false
        });
        this.get = function() {
            var iThisIndx;
            for (var sKey in oStorage) {
                iThisIndx = aKeys.indexOf(sKey);
                if (iThisIndx === -1) {
                    oStorage.setItem(sKey, oStorage[sKey]);
                } else {
                    aKeys.splice(iThisIndx, 1);
                }
                delete oStorage[sKey];
            }
            for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
                oStorage.removeItem(aKeys[0]);
            }
            for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
                aCouple = aCouples[nIdx].split(/\s*=\s*/);
                if (aCouple.length > 1) {
                    oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
                    aKeys.push(iKey);
                }
            }
            return oStorage;
        };
        this.configurable = false;
        this.enumerable = true;
    })());
} /*! iScroll v5.2.0 ~ (c) 2008-2016 Matteo Spinelli ~ http://cubiq.org/license */
(function(window, document, Math) {
    var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
    var utils = (function() {
        var me = {};
        var _elementStyle = document.createElement('div').style;
        var _vendor = (function() {
            var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                transform, i = 0,
                l = vendors.length;
            for (; i < l; i++) {
                transform = vendors[i] + 'ransform';
                if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
            }
            return false;
        })();

        function _prefixStyle(style) {
            if (_vendor === false) return false;
            if (_vendor === '') return style;
            return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
        }
        me.getTime = Date.now || function getTime() {
            return new Date().getTime();
        };
        me.extend = function(target, obj) {
            for (var i in obj) {
                target[i] = obj[i];
            }
        };
        me.addEvent = function(el, type, fn, capture) {
            el.addEventListener(type, fn, !!capture);
        };
        me.removeEvent = function(el, type, fn, capture) {
            el.removeEventListener(type, fn, !!capture);
        };
        me.prefixPointerEvent = function(pointerEvent) {
            return window.MSPointerEvent ? 'MSPointer' + pointerEvent.charAt(7).toUpperCase() + pointerEvent.substr(8) : pointerEvent;
        };
        me.momentum = function(current, start, time, lowerMargin, wrapperSize, deceleration) {
            var distance = current - start,
                speed = Math.abs(distance) / time,
                destination, duration;
            deceleration = deceleration === undefined ? 0.0006 : deceleration;
            destination = current + (speed * speed) / (2 * deceleration) * (distance < 0 ? -1 : 1);
            duration = speed / deceleration;
            if (destination < lowerMargin) {
                destination = wrapperSize ? lowerMargin - (wrapperSize / 2.5 * (speed / 8)) : lowerMargin;
                distance = Math.abs(destination - current);
                duration = distance / speed;
            } else if (destination > 0) {
                destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                distance = Math.abs(current) + destination;
                duration = distance / speed;
            }
            return {
                destination: Math.round(destination),
                duration: duration
            };
        };
        var _transform = _prefixStyle('transform');
        me.extend(me, {
            hasTransform: _transform !== false,
            hasPerspective: _prefixStyle('perspective') in _elementStyle,
            hasTouch: 'ontouchstart' in window,
            hasPointer: !!(window.PointerEvent || window.MSPointerEvent),
            hasTransition: _prefixStyle('transition') in _elementStyle
        });
        me.isBadAndroid = (function() {
            var appVersion = window.navigator.appVersion;
            if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
                var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
                if (safariVersion && typeof safariVersion === "object" && safariVersion.length >= 2) {
                    return parseFloat(safariVersion[1]) < 535.19;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        })();
        me.extend(me.style = {}, {
            transform: _transform,
            transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
            transitionDuration: _prefixStyle('transitionDuration'),
            transitionDelay: _prefixStyle('transitionDelay'),
            transformOrigin: _prefixStyle('transformOrigin')
        });
        me.hasClass = function(e, c) {
            var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
            return re.test(e.className);
        };
        me.addClass = function(e, c) {
            if (me.hasClass(e, c)) {
                return;
            }
            var newclass = e.className.split(' ');
            newclass.push(c);
            e.className = newclass.join(' ');
        };
        me.removeClass = function(e, c) {
            if (!me.hasClass(e, c)) {
                return;
            }
            var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
            e.className = e.className.replace(re, ' ');
        };
        me.offset = function(el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;
            while (el = el.offsetParent) {
                left -= el.offsetLeft;
                top -= el.offsetTop;
            }
            return {
                left: left,
                top: top
            };
        };
        me.preventDefaultException = function(el, exceptions) {
            for (var i in exceptions) {
                if (exceptions[i].test(el[i])) {
                    return true;
                }
            }
            return false;
        };
        me.extend(me.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,
            mousedown: 2,
            mousemove: 2,
            mouseup: 2,
            pointerdown: 3,
            pointermove: 3,
            pointerup: 3,
            MSPointerDown: 3,
            MSPointerMove: 3,
            MSPointerUp: 3
        });
        me.extend(me.ease = {}, {
            quadratic: {
                style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fn: function(k) {
                    return k * (2 - k);
                }
            },
            circular: {
                style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
                fn: function(k) {
                    return Math.sqrt(1 - (--k * k));
                }
            },
            back: {
                style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fn: function(k) {
                    var b = 4;
                    return (k = k - 1) * k * ((b + 1) * k + b) + 1;
                }
            },
            bounce: {
                style: '',
                fn: function(k) {
                    if ((k /= 1) < (1 / 2.75)) {
                        return 7.5625 * k * k;
                    } else if (k < (2 / 2.75)) {
                        return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
                    } else if (k < (2.5 / 2.75)) {
                        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
                    } else {
                        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
                    }
                }
            },
            elastic: {
                style: '',
                fn: function(k) {
                    var f = 0.22,
                        e = 0.4;
                    if (k === 0) {
                        return 0;
                    }
                    if (k == 1) {
                        return 1;
                    }
                    return (e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
                }
            }
        });
        me.tap = function(e, eventName) {
            var ev = document.createEvent('Event');
            ev.initEvent(eventName, true, true);
            ev.pageX = e.pageX;
            ev.pageY = e.pageY;
            e.target.dispatchEvent(ev);
        };
        me.click = function(e) {
            var target = e.target,
                ev;
            if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
                ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
                ev.initEvent('click', true, true);
                ev.view = e.view || window;
                ev.detail = 1;
                ev.screenX = target.screenX || 0;
                ev.screenY = target.screenY || 0;
                ev.clientX = target.clientX || 0;
                ev.clientY = target.clientY || 0;
                ev.ctrlKey = !!e.ctrlKey;
                ev.altKey = !!e.altKey;
                ev.shiftKey = !!e.shiftKey;
                ev.metaKey = !!e.metaKey;
                ev.button = 0;
                ev.relatedTarget = null;
                ev._constructed = true;
                target.dispatchEvent(ev);
            }
        };
        return me;
    })();

    function IScroll(el, options) {
        this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
        this.scroller = this.wrapper.children[0];
        this.scrollerStyle = this.scroller.style;
        this.options = {
            resizeScrollbars: true,
            mouseWheelSpeed: 20,
            snapThreshold: 0.334,
            disablePointer: !utils.hasPointer,
            disableTouch: utils.hasPointer || !utils.hasTouch,
            disableMouse: utils.hasPointer || utils.hasTouch,
            startX: 0,
            startY: 0,
            scrollY: true,
            directionLockThreshold: 5,
            momentum: true,
            bounce: true,
            bounceTime: 600,
            bounceEasing: '',
            preventDefault: true,
            preventDefaultException: {
                tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/
            },
            HWCompositing: true,
            useTransition: true,
            useTransform: true,
            bindToWrapper: typeof window.onmousedown === "undefined"
        };
        for (var i in options) {
            this.options[i] = options[i];
        }
        this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';
        this.options.useTransition = utils.hasTransition && this.options.useTransition;
        this.options.useTransform = utils.hasTransform && this.options.useTransform;
        this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;
        this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
        this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;
        this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;
        this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;
        if (this.options.tap === true) {
            this.options.tap = 'tap';
        }
        if (!this.options.useTransition && !this.options.useTransform) {
            if (!(/relative|absolute/i).test(this.scrollerStyle.position)) {
                this.scrollerStyle.position = "relative";
            }
        }
        if (this.options.shrinkScrollbars == 'scale') {
            this.options.useTransition = false;
        }
        this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;
        if (this.options.probeType == 3) {
            this.options.useTransition = false;
        }
        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;
        this._events = {};
        this._init();
        this.refresh();
        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();
    }
    IScroll.prototype = {
        version: '5.2.0',
        _init: function() {
            this._initEvents();
            if (this.options.scrollbars || this.options.indicators) {
                this._initIndicators();
            }
            if (this.options.mouseWheel) {
                this._initWheel();
            }
            if (this.options.snap) {
                this._initSnap();
            }
            if (this.options.keyBindings) {
                this._initKeys();
            }
        },
        destroy: function() {
            this._initEvents(true);
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = null;
            this._execEvent('destroy');
        },
        _transitionEnd: function(e) {
            if (e.target != this.scroller || !this.isInTransition) {
                return;
            }
            this._transitionTime();
            if (!this.resetPosition(this.options.bounceTime)) {
                this.isInTransition = false;
                this._execEvent('scrollEnd');
            }
        },
        _start: function(e) {
            if (utils.eventType[e.type] != 1) {
                var button;
                if (!e.which) {
                    button = (e.button < 2) ? 0 : ((e.button == 4) ? 1 : 2);
                } else {
                    button = e.button;
                }
                if (button !== 0) {
                    return;
                }
            }
            if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
                return;
            }
            if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                e.preventDefault();
            }
            var point = e.touches ? e.touches[0] : e,
                pos;
            this.initiated = utils.eventType[e.type];
            this.moved = false;
            this.distX = 0;
            this.distY = 0;
            this.directionX = 0;
            this.directionY = 0;
            this.directionLocked = 0;
            this.startTime = utils.getTime();
            if (this.options.useTransition && this.isInTransition) {
                this._transitionTime();
                this.isInTransition = false;
                pos = this.getComputedPosition();
                this._translate(Math.round(pos.x), Math.round(pos.y));
                this._execEvent('scrollEnd');
            } else if (!this.options.useTransition && this.isAnimating) {
                this.isAnimating = false;
                this._execEvent('scrollEnd');
            }
            this.startX = this.x;
            this.startY = this.y;
            this.absStartX = this.x;
            this.absStartY = this.y;
            this.pointX = point.pageX;
            this.pointY = point.pageY;
            this._execEvent('beforeScrollStart');
        },
        _move: function(e) {
            if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                return;
            }
            if (this.options.preventDefault) {
                e.preventDefault();
            }
            var point = e.touches ? e.touches[0] : e,
                deltaX = point.pageX - this.pointX,
                deltaY = point.pageY - this.pointY,
                timestamp = utils.getTime(),
                newX, newY, absDistX, absDistY;
            this.pointX = point.pageX;
            this.pointY = point.pageY;
            this.distX += deltaX;
            this.distY += deltaY;
            absDistX = Math.abs(this.distX);
            absDistY = Math.abs(this.distY);
            if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
                return;
            }
            if (!this.directionLocked && !this.options.freeScroll) {
                if (absDistX > absDistY + this.options.directionLockThreshold) {
                    this.directionLocked = 'h';
                } else if (absDistY >= absDistX + this.options.directionLockThreshold) {
                    this.directionLocked = 'v';
                } else {
                    this.directionLocked = 'n';
                }
            }
            if (this.directionLocked == 'h') {
                if (this.options.eventPassthrough == 'vertical') {
                    e.preventDefault();
                } else if (this.options.eventPassthrough == 'horizontal') {
                    this.initiated = false;
                    return;
                }
                deltaY = 0;
            } else if (this.directionLocked == 'v') {
                if (this.options.eventPassthrough == 'horizontal') {
                    e.preventDefault();
                } else if (this.options.eventPassthrough == 'vertical') {
                    this.initiated = false;
                    return;
                }
                deltaX = 0;
            }
            deltaX = this.hasHorizontalScroll ? deltaX : 0;
            deltaY = this.hasVerticalScroll ? deltaY : 0;
            newX = this.x + deltaX;
            newY = this.y + deltaY;
            if (newX > 0 || newX < this.maxScrollX) {
                newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
            }
            if (newY > 0 || newY < this.maxScrollY) {
                newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
            }
            this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
            if (!this.moved) {
                this._execEvent('scrollStart');
            }
            this.moved = true;
            this._translate(newX, newY);
            if (timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y;
                if (this.options.probeType == 1) {
                    this._execEvent('scroll');
                }
            }
            if (this.options.probeType > 1) {
                this._execEvent('scroll');
            }
        },
        _end: function(e) {
            if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                return;
            }
            if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
                e.preventDefault();
            }
            var point = e.changedTouches ? e.changedTouches[0] : e,
                momentumX, momentumY, duration = utils.getTime() - this.startTime,
                newX = Math.round(this.x),
                newY = Math.round(this.y),
                distanceX = Math.abs(newX - this.startX),
                distanceY = Math.abs(newY - this.startY),
                time = 0,
                easing = '';
            this.isInTransition = 0;
            this.initiated = 0;
            this.endTime = utils.getTime();
            if (this.resetPosition(this.options.bounceTime)) {
                return;
            }
            this.scrollTo(newX, newY);
            if (!this.moved) {
                if (this.options.tap) {
                    utils.tap(e, this.options.tap);
                }
                if (this.options.click) {
                    utils.click(e);
                }
                this._execEvent('scrollCancel');
                return;
            }
            if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
                this._execEvent('flick');
                return;
            }
            if (this.options.momentum && duration < 300) {
                momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
                    destination: newX,
                    duration: 0
                };
                momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
                    destination: newY,
                    duration: 0
                };
                newX = momentumX.destination;
                newY = momentumY.destination;
                time = Math.max(momentumX.duration, momentumY.duration);
                this.isInTransition = 1;
            }
            if (this.options.snap) {
                var snap = this._nearestSnap(newX, newY);
                this.currentPage = snap;
                time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(newX - snap.x), 1000), Math.min(Math.abs(newY - snap.y), 1000)), 300);
                newX = snap.x;
                newY = snap.y;
                this.directionX = 0;
                this.directionY = 0;
                easing = this.options.bounceEasing;
            }
            if (newX != this.x || newY != this.y) {
                if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
                    easing = utils.ease.quadratic;
                }
                this.scrollTo(newX, newY, time, easing);
                return;
            }
            this._execEvent('scrollEnd');
        },
        _resize: function() {
            var that = this;
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(function() {
                that.refresh();
            }, this.options.resizePolling);
        },
        resetPosition: function(time) {
            var x = this.x,
                y = this.y;
            time = time || 0;
            if (!this.hasHorizontalScroll || this.x > 0) {
                x = 0;
            } else if (this.x < this.maxScrollX) {
                x = this.maxScrollX;
            }
            if (!this.hasVerticalScroll || this.y > 0) {
                y = 0;
            } else if (this.y < this.maxScrollY) {
                y = this.maxScrollY;
            }
            if (x == this.x && y == this.y) {
                return false;
            }
            this.scrollTo(x, y, time, this.options.bounceEasing);
            return true;
        },
        disable: function() {
            this.enabled = false;
        },
        enable: function() {
            this.enabled = true;
        },
        refresh: function() {
            var rf = this.wrapper.offsetHeight;
            this.wrapperWidth = this.wrapper.clientWidth;
            this.wrapperHeight = this.wrapper.clientHeight;
            this.scrollerWidth = this.scroller.offsetWidth;
            this.scrollerHeight = this.scroller.offsetHeight;
            this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
            this.maxScrollY = this.wrapperHeight - this.scrollerHeight;
            this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
            this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;
            if (!this.hasHorizontalScroll) {
                this.maxScrollX = 0;
                this.scrollerWidth = this.wrapperWidth;
            }
            if (!this.hasVerticalScroll) {
                this.maxScrollY = 0;
                this.scrollerHeight = this.wrapperHeight;
            }
            this.endTime = 0;
            this.directionX = 0;
            this.directionY = 0;
            this.wrapperOffset = utils.offset(this.wrapper);
            this._execEvent('refresh');
            this.resetPosition();
        },
        on: function(type, fn) {
            if (!this._events[type]) {
                this._events[type] = [];
            }
            this._events[type].push(fn);
        },
        off: function(type, fn) {
            if (!this._events[type]) {
                return;
            }
            var index = this._events[type].indexOf(fn);
            if (index > -1) {
                this._events[type].splice(index, 1);
            }
        },
        _execEvent: function(type) {
            if (!this._events[type]) {
                return;
            }
            var i = 0,
                l = this._events[type].length;
            if (!l) {
                return;
            }
            for (; i < l; i++) {
                this._events[type][i].apply(this, [].slice.call(arguments, 1));
            }
        },
        scrollBy: function(x, y, time, easing) {
            x = this.x + x;
            y = this.y + y;
            time = time || 0;
            this.scrollTo(x, y, time, easing);
        },
        scrollTo: function(x, y, time, easing) {
            easing = easing || utils.ease.circular;
            this.isInTransition = this.options.useTransition && time > 0;
            var transitionType = this.options.useTransition && easing.style;
            if (!time || transitionType) {
                if (transitionType) {
                    this._transitionTimingFunction(easing.style);
                    this._transitionTime(time);
                }
                this._translate(x, y);
            } else {
                this._animate(x, y, time, easing.fn);
            }
        },
        scrollToElement: function(el, time, offsetX, offsetY, easing) {
            el = el.nodeType ? el : this.scroller.querySelector(el);
            if (!el) {
                return;
            }
            var pos = utils.offset(el);
            pos.left -= this.wrapperOffset.left;
            pos.top -= this.wrapperOffset.top;
            if (offsetX === true) {
                offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
            }
            if (offsetY === true) {
                offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
            }
            pos.left -= offsetX || 0;
            pos.top -= offsetY || 0;
            pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
            pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;
            time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;
            this.scrollTo(pos.left, pos.top, time, easing);
        },
        _transitionTime: function(time) {
            if (!this.options.useTransition) {
                return;
            }
            time = time || 0;
            var durationProp = utils.style.transitionDuration;
            if (!durationProp) {
                return;
            }
            this.scrollerStyle[durationProp] = time + 'ms';
            if (!time && utils.isBadAndroid) {
                this.scrollerStyle[durationProp] = '0.0001ms';
                var self = this;
                rAF(function() {
                    if (self.scrollerStyle[durationProp] === '0.0001ms') {
                        self.scrollerStyle[durationProp] = '0s';
                    }
                });
            }
            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].transitionTime(time);
                }
            }
        },
        _transitionTimingFunction: function(easing) {
            this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].transitionTimingFunction(easing);
                }
            }
        },
        _translate: function(x, y) {
            if (this.options.useTransform) {
                this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
            } else {
                x = Math.round(x);
                y = Math.round(y);
                this.scrollerStyle.left = x + 'px';
                this.scrollerStyle.top = y + 'px';
            }
            this.x = x;
            this.y = y;
            if (this.indicators) {
                for (var i = this.indicators.length; i--;) {
                    this.indicators[i].updatePosition();
                }
            }
        },
        _initEvents: function(remove) {
            var eventType = remove ? utils.removeEvent : utils.addEvent,
                target = this.options.bindToWrapper ? this.wrapper : window;
            eventType(window, 'orientationchange', this);
            eventType(window, 'resize', this);
            if (this.options.click) {
                eventType(this.wrapper, 'click', this, true);
            }
            if (!this.options.disableMouse) {
                eventType(this.wrapper, 'mousedown', this);
                eventType(target, 'mousemove', this);
                eventType(target, 'mousecancel', this);
                eventType(target, 'mouseup', this);
            }
            if (utils.hasPointer && !this.options.disablePointer) {
                eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
                eventType(target, utils.prefixPointerEvent('pointermove'), this);
                eventType(target, utils.prefixPointerEvent('pointercancel'), this);
                eventType(target, utils.prefixPointerEvent('pointerup'), this);
            }
            if (utils.hasTouch && !this.options.disableTouch) {
                eventType(this.wrapper, 'touchstart', this);
                eventType(target, 'touchmove', this);
                eventType(target, 'touchcancel', this);
                eventType(target, 'touchend', this);
            }
            eventType(this.scroller, 'transitionend', this);
            eventType(this.scroller, 'webkitTransitionEnd', this);
            eventType(this.scroller, 'oTransitionEnd', this);
            eventType(this.scroller, 'MSTransitionEnd', this);
        },
        getComputedPosition: function() {
            var matrix = window.getComputedStyle(this.scroller, null),
                x, y;
            if (this.options.useTransform) {
                matrix = matrix[utils.style.transform].split(')')[0].split(', ');
                x = +(matrix[12] || matrix[4]);
                y = +(matrix[13] || matrix[5]);
            } else {
                x = +matrix.left.replace(/[^-\d.]/g, '');
                y = +matrix.top.replace(/[^-\d.]/g, '');
            }
            return {
                x: x,
                y: y
            };
        },
        _initIndicators: function() {
            var interactive = this.options.interactiveScrollbars,
                customStyle = typeof this.options.scrollbars != 'string',
                indicators = [],
                indicator;
            var that = this;
            this.indicators = [];
            if (this.options.scrollbars) {
                if (this.options.scrollY) {
                    indicator = {
                        el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenX: false
                    };
                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }
                if (this.options.scrollX) {
                    indicator = {
                        el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
                        interactive: interactive,
                        defaultScrollbars: true,
                        customStyle: customStyle,
                        resize: this.options.resizeScrollbars,
                        shrink: this.options.shrinkScrollbars,
                        fade: this.options.fadeScrollbars,
                        listenY: false
                    };
                    this.wrapper.appendChild(indicator.el);
                    indicators.push(indicator);
                }
            }
            if (this.options.indicators) {
                indicators = indicators.concat(this.options.indicators);
            }
            for (var i = indicators.length; i--;) {
                this.indicators.push(new Indicator(this, indicators[i]));
            }

            function _indicatorsMap(fn) {
                if (that.indicators) {
                    for (var i = that.indicators.length; i--;) {
                        fn.call(that.indicators[i]);
                    }
                }
            }
            if (this.options.fadeScrollbars) {
                this.on('scrollEnd', function() {
                    _indicatorsMap(function() {
                        this.fade();
                    });
                });
                this.on('scrollCancel', function() {
                    _indicatorsMap(function() {
                        this.fade();
                    });
                });
                this.on('scrollStart', function() {
                    _indicatorsMap(function() {
                        this.fade(1);
                    });
                });
                this.on('beforeScrollStart', function() {
                    _indicatorsMap(function() {
                        this.fade(1, true);
                    });
                });
            }
            this.on('refresh', function() {
                _indicatorsMap(function() {
                    this.refresh();
                });
            });
            this.on('destroy', function() {
                _indicatorsMap(function() {
                    this.destroy();
                });
                delete this.indicators;
            });
        },
        _initWheel: function() {
            utils.addEvent(this.wrapper, 'wheel', this);
            utils.addEvent(this.wrapper, 'mousewheel', this);
            utils.addEvent(this.wrapper, 'DOMMouseScroll', this);
            this.on('destroy', function() {
                clearTimeout(this.wheelTimeout);
                this.wheelTimeout = null;
                utils.removeEvent(this.wrapper, 'wheel', this);
                utils.removeEvent(this.wrapper, 'mousewheel', this);
                utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
            });
        },
        _wheel: function(e) {
            if (!this.enabled) {
                return;
            }
            e.preventDefault();
            var wheelDeltaX, wheelDeltaY, newX, newY, that = this;
            if (this.wheelTimeout === undefined) {
                that._execEvent('scrollStart');
            }
            clearTimeout(this.wheelTimeout);
            this.wheelTimeout = setTimeout(function() {
                if (!that.options.snap) {
                    that._execEvent('scrollEnd');
                }
                that.wheelTimeout = undefined;
            }, 400);
            if ('deltaX' in e) {
                if (e.deltaMode === 1) {
                    wheelDeltaX = -e.deltaX * this.options.mouseWheelSpeed;
                    wheelDeltaY = -e.deltaY * this.options.mouseWheelSpeed;
                } else {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                }
            } else if ('wheelDeltaX' in e) {
                wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
            } else if ('wheelDelta' in e) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
            } else if ('detail' in e) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
            } else {
                return;
            }
            wheelDeltaX *= this.options.invertWheelDirection;
            wheelDeltaY *= this.options.invertWheelDirection;
            if (!this.hasVerticalScroll) {
                wheelDeltaX = wheelDeltaY;
                wheelDeltaY = 0;
            }
            if (this.options.snap) {
                newX = this.currentPage.pageX;
                newY = this.currentPage.pageY;
                if (wheelDeltaX > 0) {
                    newX--;
                } else if (wheelDeltaX < 0) {
                    newX++;
                }
                if (wheelDeltaY > 0) {
                    newY--;
                } else if (wheelDeltaY < 0) {
                    newY++;
                }
                this.goToPage(newX, newY);
                return;
            }
            newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
            newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);
            this.directionX = wheelDeltaX > 0 ? -1 : wheelDeltaX < 0 ? 1 : 0;
            this.directionY = wheelDeltaY > 0 ? -1 : wheelDeltaY < 0 ? 1 : 0;
            if (newX > 0) {
                newX = 0;
            } else if (newX < this.maxScrollX) {
                newX = this.maxScrollX;
            }
            if (newY > 0) {
                newY = 0;
            } else if (newY < this.maxScrollY) {
                newY = this.maxScrollY;
            }
            this.scrollTo(newX, newY, 0);
            if (this.options.probeType > 1) {
                this._execEvent('scroll');
            }
        },
        _initSnap: function() {
            this.currentPage = {};
            if (typeof this.options.snap == 'string') {
                this.options.snap = this.scroller.querySelectorAll(this.options.snap);
            }
            this.on('refresh', function() {
                var i = 0,
                    l, m = 0,
                    n, cx, cy, x = 0,
                    y, stepX = this.options.snapStepX || this.wrapperWidth,
                    stepY = this.options.snapStepY || this.wrapperHeight,
                    el;
                this.pages = [];
                if (!this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight) {
                    return;
                }
                if (this.options.snap === true) {
                    cx = Math.round(stepX / 2);
                    cy = Math.round(stepY / 2);
                    while (x > -this.scrollerWidth) {
                        this.pages[i] = [];
                        l = 0;
                        y = 0;
                        while (y > -this.scrollerHeight) {
                            this.pages[i][l] = {
                                x: Math.max(x, this.maxScrollX),
                                y: Math.max(y, this.maxScrollY),
                                width: stepX,
                                height: stepY,
                                cx: x - cx,
                                cy: y - cy
                            };
                            y -= stepY;
                            l++;
                        }
                        x -= stepX;
                        i++;
                    }
                } else {
                    el = this.options.snap;
                    l = el.length;
                    n = -1;
                    for (; i < l; i++) {
                        if (i === 0 || el[i].offsetLeft <= el[i - 1].offsetLeft) {
                            m = 0;
                            n++;
                        }
                        if (!this.pages[m]) {
                            this.pages[m] = [];
                        }
                        x = Math.max(-el[i].offsetLeft, this.maxScrollX);
                        y = Math.max(-el[i].offsetTop, this.maxScrollY);
                        cx = x - Math.round(el[i].offsetWidth / 2);
                        cy = y - Math.round(el[i].offsetHeight / 2);
                        this.pages[m][n] = {
                            x: x,
                            y: y,
                            width: el[i].offsetWidth,
                            height: el[i].offsetHeight,
                            cx: cx,
                            cy: cy
                        };
                        if (x > this.maxScrollX) {
                            m++;
                        }
                    }
                }
                this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);
                if (this.options.snapThreshold % 1 === 0) {
                    this.snapThresholdX = this.options.snapThreshold;
                    this.snapThresholdY = this.options.snapThreshold;
                } else {
                    this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
                    this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
                }
            });
            this.on('flick', function() {
                var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.x - this.startX), 1000), Math.min(Math.abs(this.y - this.startY), 1000)), 300);
                this.goToPage(this.currentPage.pageX + this.directionX, this.currentPage.pageY + this.directionY, time);
            });
        },
        _nearestSnap: function(x, y) {
            if (!this.pages.length) {
                return {
                    x: 0,
                    y: 0,
                    pageX: 0,
                    pageY: 0
                };
            }
            var i = 0,
                l = this.pages.length,
                m = 0;
            if (Math.abs(x - this.absStartX) < this.snapThresholdX && Math.abs(y - this.absStartY) < this.snapThresholdY) {
                return this.currentPage;
            }
            if (x > 0) {
                x = 0;
            } else if (x < this.maxScrollX) {
                x = this.maxScrollX;
            }
            if (y > 0) {
                y = 0;
            } else if (y < this.maxScrollY) {
                y = this.maxScrollY;
            }
            for (; i < l; i++) {
                if (x >= this.pages[i][0].cx) {
                    x = this.pages[i][0].x;
                    break;
                }
            }
            l = this.pages[i].length;
            for (; m < l; m++) {
                if (y >= this.pages[0][m].cy) {
                    y = this.pages[0][m].y;
                    break;
                }
            }
            if (i == this.currentPage.pageX) {
                i += this.directionX;
                if (i < 0) {
                    i = 0;
                } else if (i >= this.pages.length) {
                    i = this.pages.length - 1;
                }
                x = this.pages[i][0].x;
            }
            if (m == this.currentPage.pageY) {
                m += this.directionY;
                if (m < 0) {
                    m = 0;
                } else if (m >= this.pages[0].length) {
                    m = this.pages[0].length - 1;
                }
                y = this.pages[0][m].y;
            }
            return {
                x: x,
                y: y,
                pageX: i,
                pageY: m
            };
        },
        goToPage: function(x, y, time, easing) {
            easing = easing || this.options.bounceEasing;
            if (x >= this.pages.length) {
                x = this.pages.length - 1;
            } else if (x < 0) {
                x = 0;
            }
            if (y >= this.pages[x].length) {
                y = this.pages[x].length - 1;
            } else if (y < 0) {
                y = 0;
            }
            var posX = this.pages[x][y].x,
                posY = this.pages[x][y].y;
            time = time === undefined ? this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(posX - this.x), 1000), Math.min(Math.abs(posY - this.y), 1000)), 300) : time;
            this.currentPage = {
                x: posX,
                y: posY,
                pageX: x,
                pageY: y
            };
            this.scrollTo(posX, posY, time, easing);
        },
        next: function(time, easing) {
            var x = this.currentPage.pageX,
                y = this.currentPage.pageY;
            x++;
            if (x >= this.pages.length && this.hasVerticalScroll) {
                x = 0;
                y++;
            }
            this.goToPage(x, y, time, easing);
        },
        prev: function(time, easing) {
            var x = this.currentPage.pageX,
                y = this.currentPage.pageY;
            x--;
            if (x < 0 && this.hasVerticalScroll) {
                x = 0;
                y--;
            }
            this.goToPage(x, y, time, easing);
        },
        _initKeys: function(e) {
            var keys = {
                pageUp: 33,
                pageDown: 34,
                end: 35,
                home: 36,
                left: 37,
                up: 38,
                right: 39,
                down: 40
            };
            var i;
            if (typeof this.options.keyBindings == 'object') {
                for (i in this.options.keyBindings) {
                    if (typeof this.options.keyBindings[i] == 'string') {
                        this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
                    }
                }
            } else {
                this.options.keyBindings = {};
            }
            for (i in keys) {
                this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
            }
            utils.addEvent(window, 'keydown', this);
            this.on('destroy', function() {
                utils.removeEvent(window, 'keydown', this);
            });
        },
        _key: function(e) {
            if (!this.enabled) {
                return;
            }
            var snap = this.options.snap,
                newX = snap ? this.currentPage.pageX : this.x,
                newY = snap ? this.currentPage.pageY : this.y,
                now = utils.getTime(),
                prevTime = this.keyTime || 0,
                acceleration = 0.250,
                pos;
            if (this.options.useTransition && this.isInTransition) {
                pos = this.getComputedPosition();
                this._translate(Math.round(pos.x), Math.round(pos.y));
                this.isInTransition = false;
            }
            this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;
            switch (e.keyCode) {
                case this.options.keyBindings.pageUp:
                    if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                        newX += snap ? 1 : this.wrapperWidth;
                    } else {
                        newY += snap ? 1 : this.wrapperHeight;
                    }
                    break;
                case this.options.keyBindings.pageDown:
                    if (this.hasHorizontalScroll && !this.hasVerticalScroll) {
                        newX -= snap ? 1 : this.wrapperWidth;
                    } else {
                        newY -= snap ? 1 : this.wrapperHeight;
                    }
                    break;
                case this.options.keyBindings.end:
                    newX = snap ? this.pages.length - 1 : this.maxScrollX;
                    newY = snap ? this.pages[0].length - 1 : this.maxScrollY;
                    break;
                case this.options.keyBindings.home:
                    newX = 0;
                    newY = 0;
                    break;
                case this.options.keyBindings.left:
                    newX += snap ? -1 : 5 + this.keyAcceleration >> 0;
                    break;
                case this.options.keyBindings.up:
                    newY += snap ? 1 : 5 + this.keyAcceleration >> 0;
                    break;
                case this.options.keyBindings.right:
                    newX -= snap ? -1 : 5 + this.keyAcceleration >> 0;
                    break;
                case this.options.keyBindings.down:
                    newY -= snap ? 1 : 5 + this.keyAcceleration >> 0;
                    break;
                default:
                    return;
            }
            if (snap) {
                this.goToPage(newX, newY);
                return;
            }
            if (newX > 0) {
                newX = 0;
                this.keyAcceleration = 0;
            } else if (newX < this.maxScrollX) {
                newX = this.maxScrollX;
                this.keyAcceleration = 0;
            }
            if (newY > 0) {
                newY = 0;
                this.keyAcceleration = 0;
            } else if (newY < this.maxScrollY) {
                newY = this.maxScrollY;
                this.keyAcceleration = 0;
            }
            this.scrollTo(newX, newY, 0);
            this.keyTime = now;
        },
        _animate: function(destX, destY, duration, easingFn) {
            var that = this,
                startX = this.x,
                startY = this.y,
                startTime = utils.getTime(),
                destTime = startTime + duration;

            function step() {
                var now = utils.getTime(),
                    newX, newY, easing;
                if (now >= destTime) {
                    that.isAnimating = false;
                    that._translate(destX, destY);
                    if (!that.resetPosition(that.options.bounceTime)) {
                        that._execEvent('scrollEnd');
                    }
                    return;
                }
                now = (now - startTime) / duration;
                easing = easingFn(now);
                newX = (destX - startX) * easing + startX;
                newY = (destY - startY) * easing + startY;
                that._translate(newX, newY);
                if (that.isAnimating) {
                    rAF(step);
                }
                if (that.options.probeType == 3) {
                    that._execEvent('scroll');
                }
            }
            this.isAnimating = true;
            step();
        },
        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    this._resize();
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    this._transitionEnd(e);
                    break;
                case 'wheel':
                case 'DOMMouseScroll':
                case 'mousewheel':
                    this._wheel(e);
                    break;
                case 'keydown':
                    this._key(e);
                    break;
                case 'click':
                    if (this.enabled && !e._constructed) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    break;
            }
        }
    };

    function createDefaultScrollbar(direction, interactive, type) {
        var scrollbar = document.createElement('div'),
            indicator = document.createElement('div');
        if (type === true) {
            scrollbar.style.cssText = 'position:absolute;z-index:9999';
            indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
        }
        indicator.className = 'iScrollIndicator';
        if (direction == 'h') {
            if (type === true) {
                scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
                indicator.style.height = '100%';
            }
            scrollbar.className = 'iScrollHorizontalScrollbar';
        } else {
            if (type === true) {
                scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
                indicator.style.width = '100%';
            }
            scrollbar.className = 'iScrollVerticalScrollbar';
        }
        scrollbar.style.cssText += ';overflow:hidden';
        if (!interactive) {
            scrollbar.style.pointerEvents = 'none';
        }
        scrollbar.appendChild(indicator);
        return scrollbar;
    }

    function Indicator(scroller, options) {
        this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
        this.wrapperStyle = this.wrapper.style;
        this.indicator = this.wrapper.children[0];
        this.indicatorStyle = this.indicator.style;
        this.scroller = scroller;
        this.options = {
            listenX: true,
            listenY: true,
            interactive: false,
            resize: true,
            defaultScrollbars: false,
            shrink: false,
            fade: false,
            speedRatioX: 0,
            speedRatioY: 0
        };
        for (var i in options) {
            this.options[i] = options[i];
        }
        this.sizeRatioX = 1;
        this.sizeRatioY = 1;
        this.maxPosX = 0;
        this.maxPosY = 0;
        if (this.options.interactive) {
            if (!this.options.disableTouch) {
                utils.addEvent(this.indicator, 'touchstart', this);
                utils.addEvent(window, 'touchend', this);
            }
            if (!this.options.disablePointer) {
                utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
            }
            if (!this.options.disableMouse) {
                utils.addEvent(this.indicator, 'mousedown', this);
                utils.addEvent(window, 'mouseup', this);
            }
        }
        if (this.options.fade) {
            this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
            var durationProp = utils.style.transitionDuration;
            if (!durationProp) {
                return;
            }
            this.wrapperStyle[durationProp] = utils.isBadAndroid ? '0.0001ms' : '0ms';
            var self = this;
            if (utils.isBadAndroid) {
                rAF(function() {
                    if (self.wrapperStyle[durationProp] === '0.0001ms') {
                        self.wrapperStyle[durationProp] = '0s';
                    }
                });
            }
            this.wrapperStyle.opacity = '0';
        }
    }
    Indicator.prototype = {
        handleEvent: function(e) {
            switch (e.type) {
                case 'touchstart':
                case 'pointerdown':
                case 'MSPointerDown':
                case 'mousedown':
                    this._start(e);
                    break;
                case 'touchmove':
                case 'pointermove':
                case 'MSPointerMove':
                case 'mousemove':
                    this._move(e);
                    break;
                case 'touchend':
                case 'pointerup':
                case 'MSPointerUp':
                case 'mouseup':
                case 'touchcancel':
                case 'pointercancel':
                case 'MSPointerCancel':
                case 'mousecancel':
                    this._end(e);
                    break;
            }
        },
        destroy: function() {
            if (this.options.fadeScrollbars) {
                clearTimeout(this.fadeTimeout);
                this.fadeTimeout = null;
            }
            if (this.options.interactive) {
                utils.removeEvent(this.indicator, 'touchstart', this);
                utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                utils.removeEvent(this.indicator, 'mousedown', this);
                utils.removeEvent(window, 'touchmove', this);
                utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                utils.removeEvent(window, 'mousemove', this);
                utils.removeEvent(window, 'touchend', this);
                utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
                utils.removeEvent(window, 'mouseup', this);
            }
            if (this.options.defaultScrollbars) {
                this.wrapper.parentNode.removeChild(this.wrapper);
            }
        },
        _start: function(e) {
            var point = e.touches ? e.touches[0] : e;
            e.preventDefault();
            e.stopPropagation();
            this.transitionTime();
            this.initiated = true;
            this.moved = false;
            this.lastPointX = point.pageX;
            this.lastPointY = point.pageY;
            this.startTime = utils.getTime();
            if (!this.options.disableTouch) {
                utils.addEvent(window, 'touchmove', this);
            }
            if (!this.options.disablePointer) {
                utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
            }
            if (!this.options.disableMouse) {
                utils.addEvent(window, 'mousemove', this);
            }
            this.scroller._execEvent('beforeScrollStart');
        },
        _move: function(e) {
            var point = e.touches ? e.touches[0] : e,
                deltaX, deltaY, newX, newY, timestamp = utils.getTime();
            if (!this.moved) {
                this.scroller._execEvent('scrollStart');
            }
            this.moved = true;
            deltaX = point.pageX - this.lastPointX;
            this.lastPointX = point.pageX;
            deltaY = point.pageY - this.lastPointY;
            this.lastPointY = point.pageY;
            newX = this.x + deltaX;
            newY = this.y + deltaY;
            this._pos(newX, newY);
            if (this.scroller.options.probeType == 1 && timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.scroller._execEvent('scroll');
            } else if (this.scroller.options.probeType > 1) {
                this.scroller._execEvent('scroll');
            }
            e.preventDefault();
            e.stopPropagation();
        },
        _end: function(e) {
            if (!this.initiated) {
                return;
            }
            this.initiated = false;
            e.preventDefault();
            e.stopPropagation();
            utils.removeEvent(window, 'touchmove', this);
            utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
            utils.removeEvent(window, 'mousemove', this);
            if (this.scroller.options.snap) {
                var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);
                var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.scroller.x - snap.x), 1000), Math.min(Math.abs(this.scroller.y - snap.y), 1000)), 300);
                if (this.scroller.x != snap.x || this.scroller.y != snap.y) {
                    this.scroller.directionX = 0;
                    this.scroller.directionY = 0;
                    this.scroller.currentPage = snap;
                    this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
                }
            }
            if (this.moved) {
                this.scroller._execEvent('scrollEnd');
            }
        },
        transitionTime: function(time) {
            time = time || 0;
            var durationProp = utils.style.transitionDuration;
            if (!durationProp) {
                return;
            }
            this.indicatorStyle[durationProp] = time + 'ms';
            if (!time && utils.isBadAndroid) {
                this.indicatorStyle[durationProp] = '0.0001ms';
                var self = this;
                rAF(function() {
                    if (self.indicatorStyle[durationProp] === '0.0001ms') {
                        self.indicatorStyle[durationProp] = '0s';
                    }
                });
            }
        },
        transitionTimingFunction: function(easing) {
            this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
        },
        refresh: function() {
            this.transitionTime();
            if (this.options.listenX && !this.options.listenY) {
                this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
            } else if (this.options.listenY && !this.options.listenX) {
                this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
            } else {
                this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
            }
            if (this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll) {
                utils.addClass(this.wrapper, 'iScrollBothScrollbars');
                utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');
                if (this.options.defaultScrollbars && this.options.customStyle) {
                    if (this.options.listenX) {
                        this.wrapper.style.right = '8px';
                    } else {
                        this.wrapper.style.bottom = '8px';
                    }
                }
            } else {
                utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
                utils.addClass(this.wrapper, 'iScrollLoneScrollbar');
                if (this.options.defaultScrollbars && this.options.customStyle) {
                    if (this.options.listenX) {
                        this.wrapper.style.right = '2px';
                    } else {
                        this.wrapper.style.bottom = '2px';
                    }
                }
            }
            var r = this.wrapper.offsetHeight;
            if (this.options.listenX) {
                this.wrapperWidth = this.wrapper.clientWidth;
                if (this.options.resize) {
                    this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
                    this.indicatorStyle.width = this.indicatorWidth + 'px';
                } else {
                    this.indicatorWidth = this.indicator.clientWidth;
                }
                this.maxPosX = this.wrapperWidth - this.indicatorWidth;
                if (this.options.shrink == 'clip') {
                    this.minBoundaryX = -this.indicatorWidth + 8;
                    this.maxBoundaryX = this.wrapperWidth - 8;
                } else {
                    this.minBoundaryX = 0;
                    this.maxBoundaryX = this.maxPosX;
                }
                this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));
            }
            if (this.options.listenY) {
                this.wrapperHeight = this.wrapper.clientHeight;
                if (this.options.resize) {
                    this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
                    this.indicatorStyle.height = this.indicatorHeight + 'px';
                } else {
                    this.indicatorHeight = this.indicator.clientHeight;
                }
                this.maxPosY = this.wrapperHeight - this.indicatorHeight;
                if (this.options.shrink == 'clip') {
                    this.minBoundaryY = -this.indicatorHeight + 8;
                    this.maxBoundaryY = this.wrapperHeight - 8;
                } else {
                    this.minBoundaryY = 0;
                    this.maxBoundaryY = this.maxPosY;
                }
                this.maxPosY = this.wrapperHeight - this.indicatorHeight;
                this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
            }
            this.updatePosition();
        },
        updatePosition: function() {
            var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
                y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;
            if (!this.options.ignoreBoundaries) {
                if (x < this.minBoundaryX) {
                    if (this.options.shrink == 'scale') {
                        this.width = Math.max(this.indicatorWidth + x, 8);
                        this.indicatorStyle.width = this.width + 'px';
                    }
                    x = this.minBoundaryX;
                } else if (x > this.maxBoundaryX) {
                    if (this.options.shrink == 'scale') {
                        this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
                        this.indicatorStyle.width = this.width + 'px';
                        x = this.maxPosX + this.indicatorWidth - this.width;
                    } else {
                        x = this.maxBoundaryX;
                    }
                } else if (this.options.shrink == 'scale' && this.width != this.indicatorWidth) {
                    this.width = this.indicatorWidth;
                    this.indicatorStyle.width = this.width + 'px';
                }
                if (y < this.minBoundaryY) {
                    if (this.options.shrink == 'scale') {
                        this.height = Math.max(this.indicatorHeight + y * 3, 8);
                        this.indicatorStyle.height = this.height + 'px';
                    }
                    y = this.minBoundaryY;
                } else if (y > this.maxBoundaryY) {
                    if (this.options.shrink == 'scale') {
                        this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
                        this.indicatorStyle.height = this.height + 'px';
                        y = this.maxPosY + this.indicatorHeight - this.height;
                    } else {
                        y = this.maxBoundaryY;
                    }
                } else if (this.options.shrink == 'scale' && this.height != this.indicatorHeight) {
                    this.height = this.indicatorHeight;
                    this.indicatorStyle.height = this.height + 'px';
                }
            }
            this.x = x;
            this.y = y;
            if (this.scroller.options.useTransform) {
                this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
            } else {
                this.indicatorStyle.left = x + 'px';
                this.indicatorStyle.top = y + 'px';
            }
        },
        _pos: function(x, y) {
            if (x < 0) {
                x = 0;
            } else if (x > this.maxPosX) {
                x = this.maxPosX;
            }
            if (y < 0) {
                y = 0;
            } else if (y > this.maxPosY) {
                y = this.maxPosY;
            }
            x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
            y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;
            this.scroller.scrollTo(x, y);
        },
        fade: function(val, hold) {
            if (hold && !this.visible) {
                return;
            }
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
            var time = val ? 250 : 500,
                delay = val ? 0 : 300;
            val = val ? '1' : '0';
            this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';
            this.fadeTimeout = setTimeout((function(val) {
                this.wrapperStyle.opacity = val;
                this.visible = +val;
            }).bind(this, val), delay);
        }
    };
    IScroll.utils = utils;
    if (typeof module != 'undefined' && module.exports) {
        module.exports = IScroll;
    } else if (typeof define == 'function' && define.amd) {
        define(function() {
            return IScroll;
        });
    } else {
        window.IScroll = IScroll;
    }
})(window, document, Math);
(function() {
    var MooProgressBar = this.MooProgressBar = new Class({
        Implements: [Options, Events],
        element: null,
        property: 'MooProgressBar',
        options: {
            range: [0, 100],
            start: 0,
            unit: '%',
            precision: 0,
            effect_duration: 200,
            tween_property: 'width',
            inner_class: 'progressbar_inner',
            getLabel: function(progress, value, unit, precision) {
                if (unit == '%') {
                    return progress.toFixed(parseInt(precision)) + unit;
                } else {
                    return value.toFixed(parseInt(precision)) + unit;
                }
            }
        },
        initialize: function(element, options) {
            this.element = $(element);
            this.setOptions(options);
            this.inner = this.element.getElement('.' + this.options.inner_class);
            this.labels = this.element.getElements('.' + this.options.label_class);
            this.inner.set('tween', {
                unit: '%',
                duration: this.options.effect_duration,
                link: 'cancel',
                property: this.options.tween_property
            });
            if (!isNaN(this.options.range)) {
                this.options.range = [0, this.options.range];
            }
            this.setValue(this.options.start || this.options.range[0], true);
            return this.element.store(this.property, this);
        },
        setValue: function(value, no_anim) {
            return this.setProgress((value - this.options.range[0]) * 100 / (this.options.range[1] - this.options.range[0]), no_anim);
        },
        getValue: function() {
            return this.value;
        },
        setProgress: function(progress, no_anim) {
            progress = parseFloat(progress);
            if (isNaN(progress) || progress < 0) {
                progress = 0;
            } else if (progress > 100) {
                progress = 100;
            }
            if (progress != this.progress) {
                this.progress = progress;
                this.value = (this.options.range[1] - this.options.range[0]) / 100 * this.progress + this.options.range[0];
                if (this.progress >= 100 || no_anim) {
                    this.inner.get('tween').cancel().set(this.progress);
                } else {
                    this.inner.tween(this.progress);
                }
                this.setLabel(this.options.getLabel(this.progress, this.value, this.options.unit, this.options.precision));
                this.fireEvent('progress', [this.progress, this.value, this.options.unit, this.options.precision]);
            }
            if (this.progress >= 100) {
                this.fireEvent('complete', [this.value, this.options.unit, this.options.precision]);
            }
            return this;
        },
        getProgress: function() {
            return this.progress;
        },
        setLabel: function(text) {
            this.labels.set('html', text);
            return this;
        }
    });
})();
(function(root, factory) {
        if (typeof exports == 'object') module.exports = factory()
        else if (typeof define == 'function' && define.amd) define(factory)
        else root.Spinner = factory()
    }
    (this, function() {
        "use strict";
        var prefixes = ['webkit', 'Moz', 'ms', 'O'],
            animations = {},
            useCssAnimations

        function createEl(tag, prop) {
            var el = document.createElement(tag || 'div'),
                n
            for (n in prop) el[n] = prop[n]
            return el
        }

        function ins(parent) {
            for (var i = 1, n = arguments.length; i < n; i++)
                parent.appendChild(arguments[i])
            return parent
        }
        var sheet = (function() {
            var el = createEl('style', {
                type: 'text/css'
            })
            ins(document.getElementsByTagName('head')[0], el)
            return el.sheet || el.styleSheet
        }())

        function addAnimation(alpha, trail, i, lines) {
            var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-'),
                start = 0.01 + i / lines * 100,
                z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha),
                prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase(),
                pre = prefix && '-' + prefix + '-' || ''
            if (!animations[name]) {
                sheet.insertRule('@' + pre + 'keyframes ' + name + '{' + '0%{opacity:' + z + '}' +
                    start + '%{opacity:' + alpha + '}' +
                    (start + 0.01) + '%{opacity:1}' +
                    (start + trail) % 100 + '%{opacity:' + alpha + '}' + '100%{opacity:' + z + '}' + '}', sheet.cssRules.length)
                animations[name] = 1
            }
            return name
        }

        function vendor(el, prop) {
            var s = el.style,
                pp, i
            prop = prop.charAt(0).toUpperCase() + prop.slice(1)
            for (i = 0; i < prefixes.length; i++) {
                pp = prefixes[i] + prop
                if (s[pp] !== undefined) return pp
            }
            if (s[prop] !== undefined) return prop
        }

        function css(el, prop) {
            for (var n in prop)
                el.style[vendor(el, n) || n] = prop[n]
            return el
        }

        function merge(obj) {
            for (var i = 1; i < arguments.length; i++) {
                var def = arguments[i]
                for (var n in def)
                    if (obj[n] === undefined) obj[n] = def[n]
            }
            return obj
        }

        function pos(el) {
            var o = {
                x: el.offsetLeft,
                y: el.offsetTop
            }
            while ((el = el.offsetParent))
                o.x += el.offsetLeft, o.y += el.offsetTop
            return o
        }

        function getColor(color, idx) {
            return typeof color == 'string' ? color : color[idx % color.length]
        }
        var defaults = {
            lines: 12,
            length: 7,
            width: 5,
            radius: 10,
            rotate: 0,
            corners: 1,
            color: '#000',
            direction: 1,
            speed: 1,
            trail: 100,
            opacity: 1 / 4,
            fps: 20,
            zIndex: 2e9,
            className: 'spinner',
            top: '50%',
            left: '50%',
            position: 'absolute'
        }

        function Spinner(o) {
            this.opts = merge(o || {}, Spinner.defaults, defaults)
        }
        Spinner.defaults = {}
        merge(Spinner.prototype, {
            spin: function(target) {
                this.stop()
                var self = this,
                    o = self.opts,
                    el = self.el = css(createEl(0, {
                        className: o.className
                    }), {
                        position: o.position,
                        width: 0,
                        zIndex: o.zIndex
                    }),
                    mid = o.radius + o.length + o.width
                css(el, {
                    left: o.left,
                    top: o.top
                })
                if (target) {
                    target.insertBefore(el, target.firstChild || null)
                }
                el.setAttribute('role', 'progressbar')
                self.lines(el, self.opts)
                if (!useCssAnimations) {
                    var i = 0,
                        start = (o.lines - 1) * (1 - o.direction) / 2,
                        alpha, fps = o.fps,
                        f = fps / o.speed,
                        ostep = (1 - o.opacity) / (f * o.trail / 100),
                        astep = f / o.lines;
                    (function anim() {
                        i++;
                        for (var j = 0; j < o.lines; j++) {
                            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)
                            self.opacity(el, j * o.direction + start, alpha, o)
                        }
                        self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
                    })()
                }
                return self
            },
            stop: function() {
                var el = this.el
                if (el) {
                    clearTimeout(this.timeout)
                    if (el.parentNode) el.parentNode.removeChild(el)
                    this.el = undefined
                }
                return this
            },
            lines: function(el, o) {
                var i = 0,
                    start = (o.lines - 1) * (1 - o.direction) / 2,
                    seg

                function fill(color, shadow) {
                    return css(createEl(), {
                        position: 'absolute',
                        width: (o.length + o.width) + 'px',
                        height: o.width + 'px',
                        background: color,
                        boxShadow: shadow,
                        transformOrigin: 'left',
                        transform: 'rotate(' + ~~(360 / o.lines * i + o.rotate) + 'deg) translate(' + o.radius + 'px' + ',0)',
                        borderRadius: (o.corners * o.width >> 1) + 'px'
                    })
                }
                for (; i < o.lines; i++) {
                    seg = css(createEl(), {
                        position: 'absolute',
                        top: 1 + ~(o.width / 2) + 'px',
                        transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
                        opacity: o.opacity,
                        animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
                    })
                    if (o.shadow) ins(seg, css(fill('#aaa', '0 0 4px ' + 'rgba(0,0,0,0.3)'), {
                        top: 2 + 'px'
                    }))
                    ins(el, ins(seg, fill(getColor(o.color, i), '0 0 0 rgba(0,0,0,0)')))
                }
                return el
            },
            opacity: function(el, i, val) {
                if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
            }
        })

        function initVML() {
            function vml(tag, attr) {
                return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
            }
            sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')
            Spinner.prototype.lines = function(el, o) {
                var r = o.length + o.width,
                    s = 2 * r

                function grp() {
                    return css(vml('group', {
                        coordsize: s + ' ' + s,
                        coordorigin: -r + ' ' + -r
                    }), {
                        width: s,
                        height: s
                    })
                }
                var margin = -(o.width + o.length) * 2 + 'px',
                    g = css(grp(), {
                        position: 'absolute',
                        top: margin,
                        left: margin
                    }),
                    i

                function seg(i, dx, filter) {
                    ins(g, ins(css(grp(), {
                        rotation: 360 / o.lines * i + 'deg',
                        left: ~~dx
                    }), ins(css(vml('roundrect', {
                        arcsize: o.corners
                    }), {
                        width: r,
                        height: o.width,
                        left: o.radius,
                        top: -o.width >> 1,
                        filter: filter
                    }), vml('fill', {
                        color: getColor(o.color, i),
                        opacity: o.opacity
                    }), vml('stroke', {
                        opacity: 0
                    }))))
                }
                if (o.shadow)
                    for (i = 1; i <= o.lines; i++)
                        seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')
                for (i = 1; i <= o.lines; i++) seg(i)
                return ins(el, g)
            }
            Spinner.prototype.opacity = function(el, i, val, o) {
                var c = el.firstChild
                o = o.shadow && o.lines || 0
                if (c && i + o < c.childNodes.length) {
                    c = c.childNodes[i + o];
                    c = c && c.firstChild;
                    c = c && c.firstChild
                    if (c) c.opacity = val
                }
            }
        }
        var probe = css(createEl('group'), {
            behavior: 'url(#default#VML)'
        })
        if (!vendor(probe, 'transform') && probe.adj) initVML()
        else useCssAnimations = vendor(probe, 'animation')
        return Spinner
    }));

function popMessage(message, type, callback) {
    switch (type) {
        case 'undoMessage':
            var msg = new Element('div', {
                'class': 'message info',
                html: message
            });
            var buttons = new Element('div', {
                'class': 'buttons'
            });
            var button = new Element('button', {
                'class': 'infoButton',
                'text': jsLangStrings['UNDO']
            });
            button.addEvent('click', function(el) {
                callback();
                setTimeout(function() {
                    disappear(msg, 1000);
                }, 0);
            });
            setTimeout(function() {
                disappear(msg, 1000);
            }, 15000);
            buttons.adopt(new Element('button', {
                'class': 'infoButton',
                'text': jsLangStrings['OK']
            }));
            buttons.adopt(button);
            msg.adopt(buttons);
            $('messages').adopt(msg);
            break;
        case 'confirmMessage':
            var msg = new Element('div', {
                'class': 'message info',
                html: message
            });
            var buttons = new Element('div', {
                'class': 'buttons'
            });
            var button = new Element('button', {
                'class': 'infoButton',
                'text': jsLangStrings['OK']
            });
            button.addEvent('click', function(el) {
                if (callback != undefined)
                    callback();
                setTimeout(function() {
                    disappear(msg, 1000);
                }, 0);
            });
            buttons.adopt(button);
            msg.adopt(buttons);
            $('messages').adopt(msg);
            break;
        case 'warningMessage':
            var msg = new Element('div', {
                'class': 'message warning',
                html: message
            });
            setTimeout(function() {
                disappear(msg, 1000);
            }, 5000);
            $('messages').adopt(msg);
            break;
        case 'infoMessage':
            var msg = new Element('div', {
                'class': 'message info',
                html: message
            });
            setTimeout(function() {
                disappear(msg, 1000);
            }, 3000);
            $('messages').adopt(msg);
            break;
        case 'infoMessageLong':
            var msg = new Element('div', {
                'class': 'message info',
                html: message
            });
            setTimeout(function() {
                disappear(msg, 1000);
            }, 8000);
            $('messages').adopt(msg);
            break;
        case 'emeraldChoice':
            var msg = new Element('div', {
                'class': 'message emeraldChoice',
                html: message
            })
            setTimeout(function() {
                disappear(msg, 1000);
            }, 500);
            break;
        default:
            var msg = new Element('div', {
                'class': 'message info',
                html: message
            });
            setTimeout(function() {
                disappear(msg, 1000);
            }, 5000);
            break;
    }
    msg.addEvent('click', function(ev) {
        ev.stopPropagation();
        setTimeout(function() {
            disappear(msg, 1000);
        }, 0);
    });
    $('messages').adopt(msg);
}

function disappear(el, time) {
    setTimeout(function() {
        el.setStyle('opacity', 0);
    }, 0);
    setTimeout(function() {
        el.destroy();
    }, time);
}
window.addEvent('domready', function() {
    $('modalWrapper').addEvent('click', function(event) {
        event.stopPropagation();
    });
    $('modalOverlay').addEvent('click', function(event) {
        event.stopPropagation();
        closeModal();
    });
    $('modalContent').addEvent('click', function(event) {
        event.stopPropagation();
    });
    $$('.closeModal').addEvent('click', function() {
        closeModal();
    });
    window.addEvent('keydown', function(ev) {
        if (ev.key == 'esc') closeModal();
    });
    $$('.modalLink').addEvent('click', function(ev) {
        ev.preventDefault();
        modal({
            url: this.href
        });
    });
    $$('.modalZoom').addEvent('click', function(ev) {
        ev.preventDefault();
        modal({
            'content': '<img class="modalImage" src="' + ev.target.get('data-zoom') + '">'
        });
    });
});

function returnGrabbedElement() {
    if (typeof this.grabParent !== 'undefined' && this.grabParent) {
        Array.each($('modalContent').getChildren(), function(child) {
            this.grabParent.grab(child);
        });
    }
    this.grabParent = null;
}

function modal(input) {
    returnGrabbedElement();
    $('modalContent').empty();
    $$('.modalCloser').removeClass('hide');
    if (typeof input.noClose != 'undefined') {
        $$('.modalCloser').addClass('hide');
    }
    if (input.url != undefined) {
        var req = new Request.HTML({
            url: input.url,
            update: $('modalContent'),
            onSuccess: function() {
                document.getElement('body').setStyle('overflow', 'hidden');
                $('modalWrapper').removeClass('hide');
                window.fireEvent('DOMModalLoaded');
            }
        }).get();
    } else if (input.content != undefined) {
        $('modalContent').set('html', input.content);
        $('modalWrapper').removeClass('hide');
    } else if (input.el != undefined) {
        $('modalContent').adopt(input.el.clone());
        $('modalWrapper').removeClass('hide');
        window.fireEvent('DOMModalLoaded');
    } else if (input.grab != undefined) {
        this.grabParent = input.grab.getParent();
        $('modalContent').grab(input.grab);
        $('modalWrapper').removeClass('hide');
    }
    return undefined;
}

function closeModal() {
    $('modalWrapper').addClass('hide');
    document.getElement('body').setStyle('overflow', 'auto');
    setTimeout(function() {
        returnGrabbedElement();
        $('modalContent').empty();
    }, 100);
}
window.addEvent('domready', function() {
    if ($('topCart') != undefined) {
        $('topCart').update = function() {
            var self = this;
            new Request.JSON({
                url: window.ajaj + '/checkout/cartCount',
                onSuccess: function() {
                    if (this.response.json > 0) {
                        self.removeClass('empty')
                    } else {
                        self.addClass('empty')
                    };
                    $('topCartCount').set('html', this.response.json);
                }
            }).get();
        }
    }
});

function showCartSummary() {
    if ($('topCart'))
        $('topCart').update();
}
window.addEvent('domready', function() {
    $$('.carousel').each(function(el) {
        var indicator = el.getElement('.quickNav');
        el.iscroll = new IScroll('#' + el.id, {
            scrollX: true,
            scrollY: false,
            snap: true,
            bounce: true,
            click: true,
            indicators: {
                el: indicator,
                resize: false,
                interactive: true
            }
        });
        indicator.getElements('.page').each(function(e) {
            e.addEvent('click', function() {
                el.iscroll.goToPage(e.get('data-page'), 0);
                window.clearInterval(el.interval);
            })
        });
        if (el.get('data-delay')) {
            el.interval = window.setInterval(function() {
                el.nextPage();
            }, el.get('data-delay'));
        }
        el.refreshSizes = function() {
            var container = this;
            container.setStyle('height', container.getSize().x / container.get('data-ratio'));
            this.getElements('.slides li').each(function(slide) {
                slide.setStyle('width', container.getSize().x);
                slide.setStyle('height', container.getSize().y);
            });
            this.iscroll.refresh();
        };
        el.getPageCount = function() {
            return el.getElement('ul').getChildren().length;
        };
        el.nextPage = function() {
            if (el.iscroll.currentPage.pageX + 1 == el.getPageCount()) return el.iscroll.goToPage(0, 0, el.get('data-speed'));
            return el.iscroll.goToPage(el.iscroll.currentPage.pageX + 1, 0, el.get('data-speed'));
        }
        el.refreshSizes();
    });
    window.addEvent('resize', function() {
        $$('.carousel').each(function(el) {
            el.refreshSizes();
        });
    });
});
window.addEvent('domready', function() {
    $$('.slideshow').each(function(el) {
        if (el.get('data-interval'))
            var interval = el.get('data-interval');
        else
            var interval = 20000;
        el.getFirst('.slide').addClass('active');
        el.slideShow = setInterval(nextSlide, interval, el);
        el.addEvent('click', function() {
            clearInterval(el.slideShow);
        });
        if (el.getElements('.slide').length > 1) {
            var next = new Element('div');
            next.addClass('slideControl nextSlide');
            next.addEvent('click', function() {
                clearInterval(el.slideShow);
                nextSlide(el);
            });
            el.grab(next);
            var prev = new Element('div');
            prev.addClass('slideControl prevSlide');
            prev.addEvent('click', function() {
                clearInterval(el.slideShow);
                prevSlide(el);
            });
            el.grab(prev);
        }
    });

    function nextSlide(el) {
        el.getElements('.slide.active').each(function(act) {
            act.removeClass('active');
            if (act.getNext('.slide') != null) {
                act.getNext('.slide').addClass('active');
            } else {
                el.getFirst('.slide').addClass('active');
            }
        });
    }

    function prevSlide(el) {
        el.getElements('.slide.active').each(function(act) {
            act.removeClass('active');
            if (act.getPrevious('.slide') != null) {
                act.getPrevious('.slide').addClass('active');
            } else {
                el.getLast('.slide').addClass('active');
            }
        });
    }
});
Element.NativeEvents.tap = 2;
var TSMenu = new Class({
    rootElement: false,
    initialize: function(element) {
        var self = this;
        self.rootElement = $(element);
        self.rootElement.openMenu = self.openMenu.bind(self);
        self.rootElement.refresh = self.refresh.bind(self);
        self.rootElement.getParent().getElements('.menubutton').each(function(el) {
            el.addEvent('click', function(ev) {
                ev.stopPropagation();
                self.rootElement.toggleClass('show');
            })
        });
        self.rootElement.getElements('.menu > ul > li').each(function(el) {
            if (self.isMobile()) el.addEvent('tap', function(ev) {
                self.rootElement.openMenu(this)
            });
            else el.addEvent('click', function(ev) {
                self.rootElement.openMenu(this)
            });
        });
        if (self.isMobile()) {
            setTimeout(function() {
                self.rootElement.iScroll = new IScroll(self.rootElement.getElement('.menu'), {
                    mouseWheel: true,
                    click: false,
                    tap: true,
                    scrollY: true,
                    scrollX: false,
                    preventDefault: true
                });
            }, 100);
            self.rootElement.getElements('a').each(function(el) {
                el.addEvent('tap', function(ev) {
                    el.click();
                });
            });
        }
        self.rootElement.getElements('.menu-content').each(function(el) {
            if (self.isMobile()) el.addEvent('tap', function(ev) {
                ev.stopPropagation();
            });
            else el.addEvent('click', function(ev) {
                ev.stopPropagation();
            });
        });
        self.rootElement.addEvent('click', function(ev) {
            ev.stopPropagation();
        });
        window.addEvent('click', function() {
            self.resetMenus();
        });
        window.addEvent('resize', function() {
            self.resetMenus();
        });
    },
    openMenu: function(el) {
        var self = this;
        el.getSiblings().each(function(sibling) {
            sibling.removeClass('open');
        });
        el.toggleClass('open');
        setTimeout(function() {
            self.rootElement.refresh();
        }, 50);
    },
    resetMenus: function() {
        if (this.isMobile()) {
            this.rootElement.removeClass('show');
        } else {
            this.rootElement.removeClass('show');
            this.rootElement.getElements('.menu > ul > li').each(function(el) {
                el.removeClass('open').removeClass('lock-open');
            });
        }
    },
    isTouch: function() {
        return ("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;
    },
    isMobile: function() {
        return (window.innerWidth < 960);
    },
    refresh: function() {
        if (typeof this.rootElement.iScroll !== 'undefined') this.rootElement.iScroll.refresh();
    }
});

function flipImage(el) {
    if (el.getElement('img').get('data-secondary') != '')
        el.getElement('img').src = el.getElement('img').get('data-secondary');
}

function flipbackImage(el) {
    el.getElement('img').src = el.getElement('img').get('data-primary');
}
window.addEvent('domready', function() {
    $$('.quick-buy-link').addEvent('click', function(ev) {
        ev.preventDefault();
        var products = {};
        Array.each(this.get('rel').split(','), function(prod) {
            products[prod] = null;
        });
        var data = {
            'products': products
        };
        if (this.get('data-discount'))
            data['discountCode'] = this.get('data-discount');
        var req = new Request.JSON({
            url: window.ajaj + '/catalog/addtocart',
            onSuccess: function(result) {
                location.href = result.url;
            }
        }).post(JSON.encode(data));
    });
    $$('.expand').addEvent('click', function(ev) {
        ev.target.getParent('.expandable').toggleClass('expanded');
    });
});
var isTouch = !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;
window.addEvent('domready', function() {
    if (isTouch)
        $$('body').addClass('touch');
    else
        $$('body').addClass('notouch');
    logVisit();
    keepAlive.periodical(1000 * 60 * 5);
    if (!Cookie.read('cookieWarningAccepted')) {
        var cookieWarningElement = document.getElement('.cookiewarning');
        if (cookieWarningElement) {
            cookieWarningElement.setStyle('display', 'block');
            $$('.cookiewarning .close').addEvent('click', function(event) {
                event.preventDefault();
                Cookie.write('cookieWarningAccepted', 1, {
                    duration: 365
                });
                cookieWarningElement.destroy();
            });
        }
    }
    window.addEvent('keydown', function(ev) {
        if (ev.key == 'h') {
            $$('.cms-panel').each(function(el) {
                el.toggleClass('nodisplay');
            })
        }
        if (ev.control && ev.shift && ev.key == 'd') {
            modal({
                'content': '<iframe src="/devtools?iframe=1" class="dtiframe" />'
            });
        }
    });
    window.spinner = new Spinner({
        lines: 15,
        length: 29,
        width: 10,
        radius: 43,
        corners: 1,
        rotate: 0,
        direction: 1,
        color: '#c19a67',
        speed: 2.0,
        trail: 25,
        shadow: false,
        hwaccel: true,
        className: 'spinner',
        zIndex: 2e9,
        top: '50%',
        left: '50%',
        position: 'fixed'
    });
    window.spin = function() {
        var body = document.getElementsByTagName('body')[0];
        body.addClass('fade');
        window.spinner.spin(body);
    };
    window.stopspin = function() {
        var body = document.getElementsByTagName('body')[0];
        body.removeClass('fade');
        window.spinner.stop();
    };
});

function checkKeepAlive(json, text) {
    var msg = false;
    var action = false;
    if (typeof json.message != 'undefined' && json.message != null && json.message) {
        msg = json.message;
    }
    if (typeof json.action != 'undefined' && json.action != null && json.action) {
        action = json.action;
    }
    if (msg && action) {
        if (confirm(msg)) {
            switch (action) {
                case 'reload':
                    window.location.reload();
                    break;
            }
        }
        return true;
    }
    if (msg) {
        alert(msg);
        return true;
    }
    if (action) {
        switch (action) {
            case 'reload':
                window.location.reload();
                break;
        }
        return true;
    }
}
Number.prototype.formatMoney = function(c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        c = n % 1 == 0 ? 0 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
var baseClass = new Class({
    options: {},
    initialize: function(options) {
        this.options = options;
        this.build();
        this.attach();
        this.afterAttach();
        return this;
    },
    build: function() {},
    attach: function() {},
    afterAttach: function() {},
    getOption: function(key, altReturn) {
        if (!key) return this.options;
        if (!altReturn) altReturn = false;
        if (typeof this.options[key] !== 'undefined') return this.options[key];
        return altReturn;
    }
});
var tsForm = new Class({
    Extends: baseClass,
    initialize: function(options) {
        this.element = $(options['id']);
        this.parent(options);
    },
    build: function() {},
    attach: function() {
        var self = this;
        this.element.clearFeedback = this.clearFeedback.bind(this);
        this.element.send = this.send.bind(this);
        this.element.validate = this.validate.bind(this);
        this.element.refresh = this.refresh.bind(this);
        this.element.addEvent('submit', function(ev) {
            if (self.getOption('is_json')) {
                ev.preventDefault();
                self.send();
                return false;
            }
            return true;
        });
        if (this.getOption('validate_on_change')) {
            Array.each(self.element.elements, function(el) {
                el.removeEvents('change');
                el.addEvent('change', function(ev) {
                    if (self.getOption('validate_only_last_changed')) {
                        self.element.getElement('[name="form_last_changed_input"]').value = ev.target.name;
                    }
                    ev.target.getParent('form').validate();
                });
            });
        }
    },
    afterAttach: function() {
        var self = this;
        if (this.getOption('validate_on_change') && this.getOption('validate_on_load')) setTimeout(function() {
            self.validate();
        }, 100);
    },
    validate: function() {
        var self = this;
        self.remoteCall(self.element.get('data-validate-action'), self.processValidation.bind(self));
    },
    send: function() {
        this.remoteCall(this.element.action, this.processResponse.bind(this));
    },
    refresh: function() {
        this.attach();
    },
    processValidation: function(responseJson) {
        var self = this;
        self.clearFeedback();
        if (typeof responseJson.messages === 'object') {
            Object.each(responseJson.messages, function(value, key) {
                Object.each(value, function(messageText, key) {
                    popMessage(messageText, key + 'Message');
                });
            });
        }
        if (typeof responseJson.feedback === 'object') {
            if (typeof responseJson.form_id === 'string') {
                var form = self.element;
                Object.each(responseJson.feedback, function(value, fieldName) {
                    Object.each(value, function(feedback) {
                        form.getElements('[name="' + fieldName + '"]').each(function(el) {
                            var parent = el.getParent('.form-group');
                            parent.addClass('has-feedback has-' + feedback['type']);
                            if (feedback['message'].length > 0) {
                                var errorElement = new Element('p', {
                                    'class': 'help-block ' + feedback['type'],
                                    'html': feedback['message']
                                });
                                parent.grab(errorElement);
                            }
                        });
                    });
                });
            }
        }
        window.fireEvent('jsonFormValidateSuccess', responseJson);
    },
    processResponse: function(responseJson) {
        this.processValidation(responseJson);
        if (typeof responseJson.status === 'string' && responseJson.status === 'ok') window.fireEvent('jsonFormSuccess', responseJson);
        if (typeof responseJson.redirect_url === 'string' && responseJson.redirect_url.length > 0) location.href = responseJson.redirect_url;
    },
    remoteCall: function(url, callbackFunction) {
        var self = this;
        new Request.JSON({
            'url': url,
            'onSuccess': function(responseJson) {
                callbackFunction(responseJson);
                if (window.spin) window.stopspin();
            }
        }).post(self.element.toQueryString());
    },
    getLastChangedElement: function() {
        return this.element.getElement('[name="' + this.element.getElement('[name="form_last_changed_input"]').value + '"]');
    },
    clearFeedback: function() {
        if (this.getOption('validate_only_last_changed')) {
            var fg = this.getLastChangedElement().getParent('.form-group');
            fg.removeClass('has-feedback has-error has-success has-warning');
            fg.getElements('.help-block').each(function(hb) {
                hb.dispose()
            });
            return this.element;
        }
        this.element.getElements('.form-group').each(function(el) {
            el.removeClass('has-feedback has-error has-success has-warning');
            el.getElements('.help-block').each(function(hb) {
                hb.dispose()
            });
        });
        return this.element;
    }
});
window.addEvent('domready', function() {
    $$('.validate').each(function(el) {
        var input = el;
        input.validations = [];
        input.validations.push(function() {
            return input.checkValidity();
        });
        if (input.hasClass('validate-required')) input.validations.push(function() {
            return input.value !== '';
        });
        input.addEvent('blur', function() {
            input.getParent().removeClass('has-error').removeClass('has-feedback').removeClass('validated');
            Array.each(input.validations, function(callback) {
                if (!callback()) input.getParent().addClass('has-error has-feedback');
            });
            if (!input.getParent().hasClass('has-error')) input.getParent().addClass('validated');
        });
    });
    $$('input').each(function(e) {
        var self = e;
        e.addEvent('blur', function(e) {
            clearError(self);
        })
    })
});

function displayErrors(errors) {
    clearErrors();
    Object.each(errors, function(error, key) {
        $$('[name="' + key + '"]').each(function(e) {
            e.getParent().addClass('has-error').addClass('has-feedback');
            e.getNext('.form-control-feedback').addClass('show');
            new Element('p', {
                'class': 'help-block',
                'html': error
            }).inject(e, 'after');
        });
    });
}

function clearErrors() {
    $$('.form-control-feedback').each(function(e) {
        e.removeClass('show');
    });
    $$('.has-error').each(function(e) {
        e.removeClass('has-feedback has-error');
    });
    $$('.help-block').each(function(e) {
        e.remove()
    });
}

function clearError(e) {
    e.getParent().removeClass('has-error').removeClass('has-feedback');
    e.getAllNext('.form-control-feedback').each(function(e) {
        e.removeClass('show');
    });
    e.getAllNext('.help-block').each(function(e) {
        e.remove();
    });
}
window.addEvent('domready', function() {
    $$('.popLoginForm').each(function(el) {
        el.addEvent('click', function() {
            modal({
                url: window.baseURL + '/customer/account/loginform'
            });
        });
    });
});
window.addEvent('load', function() {
    googleInit();
});
var auth2;

function googleInit() {
    gapi.load('auth2', function() {
        auth2 = gapi.auth2.init();
        Array.each($$('.socialButton.google'), function(elm) {
            attachSignin(elm);
        });
    });
}

function attachSignin(element) {
    auth2.attachClickHandler(element, {}, function(googleUser) {
        handleGoogleLoginResponse(googleUser);
    }, function(error) {
        console.error(error);
    });
}

function statusChangeCallback(response) {
    if (response.status === 'connected') {
        doLoginFromFacebook();
    } else if (response.status === 'not_authorized') {
        FB.login(function(response) {
            checkFacebookLoginState();
        }, {
            scope: 'public_profile,email'
        });
    } else {
        FB.login(function(response) {
            checkFacebookLoginState();
        }, {
            scope: 'public_profile,email'
        });
    }
}

function checkFacebookLoginState() {
    window.spin();
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function doLoginFromFacebook() {
    window.spin();
    new Request.JSON({
        url: window.facebookLoginUrl,
        onSuccess: function(response) {
            if (response.success && !response.already_logged_in) {
                window.location.href = window.loginRedirectUrl;
            }
            if (response.success && response.status == 'account_found') {
                window.location.href = window.loginRedirectUrl;
            }
            if (!response.success && response.status == 'account_not_found' && window.quickcreate == true) {
                window.stopspin();
                return quickCreateAccount();
            }
            if (!response.success && response.status == 'account_not_found') {
                window.stopspin();
                console.log(response);
                createNewAccountAlert(response.email);
            }
            if (!response.success && response.status == 'facebook_no_email_error') {
                window.stopspin();
                popMessage(response.message, 'confirmMessage');
            }
        },
        onError: function(response) {
            window.stopspin();
        },
        onFailure: function(response) {
            window.stopspin();
        }
    }).get();
}

function handleGoogleLoginResponse(response) {
    var id_token = response.getAuthResponse().id_token;
    new Request.JSON({
        url: window.googleLoginUrl,
        onSuccess: function(response) {
            window.stopspin();
            if (response.success) {
                return window.location.href = window.loginRedirectUrl;
            } else if (response.status == 'account_not_found' && window.quickcreate == true) {
                return quickCreateAccount();
            } else if (response.status == 'account_not_found') {
                createNewAccountAlert(response.email);
            } else if (response.status == 'invalid_token') {
                popMessage('Invalid token received', 'warningMessage');
            }
        }
    }).post({
        id_token: id_token
    });
}

function createNewAccountAlert(email) {
    window.addEvent('DOMModalLoaded', function() {
        $$('.createNewAccountButton').addEvent('click', function(event) {
            event.preventDefault();
            newAccountHandler(true);
        });
        $$('.linkAccountButton').addEvent('click', function(event) {
            event.preventDefault();
            newAccountHandler(false);
        });
    });
    modal({
        url: window.baseURL + '/social/modal/noaccount/email/' + email
    });
}

function newAccountHandler(confirmed) {
    if (confirmed) {
        new Request.JSON({
            url: window.createAccountUrl,
            onSuccess: function(response) {
                closeModal();
                window.location.href = window.createAccountThankyouUrl;
            }
        }).get('&newsletter=' + wantsNewsletter());
    } else {
        closeModal();
        var message = "<p>" + window.jsLangStrings.S_SOCIAL_SIGNIN_CONNECT_TEXT + "</p>";
        popMessage(message, 'confirmMessage');
    }
}

function quickCreateAccount() {
    var termsAgreeExists = false;
    var agreedTerms = false;
    $$('input[name=agree_terms]').each(function(el) {
        termsAgreeExists = true;
        if (el.checked === true) agreedTerms = true;
    });
    if (termsAgreeExists && !agreedTerms) {
        popMessage(jsLangStrings['MUST_AGREE_MEMBERSHIP_TERMS'], 'warningMessage');
        return false;
    }
    new Request.JSON({
        url: window.createAccountUrl,
        onSuccess: function(response) {
            window.location.href = window.createAccountThankyouUrl;
        }
    }).get('&newsletter=' + wantsNewsletter());
}

function wantsNewsletter() {
    var checked = 0;
    $$('input[name=wants_email]').each(function(el) {
        if (el.checked === true) checked = 1;
    });
    return checked;
}
window.addEvent('domready', function() {
    var tl = new Translator();
    tl.update();
    window.addEvent('click', function(ev) {
        $$('abbr.translate').each(function(el2) {
            el2.removeClass('active')
        });
    });
    $$('.t-content').each(function(el) {
        el.addEvent('paste', function(ev) {
            ev.preventDefault();
            var text = ev.event.clipboardData.getData('text/plain');
            text = text.replace(/<\/?[^>]+(>|$)/g, "");
            if (document.queryCommandSupported('insertText')) {
                document.execCommand('insertText', false, text);
            } else {
                document.execCommand('paste', false, text);
            }
        });
        el.addEvent('blur', function() {
            tl.update();
        });
        el.addEvent('focus', function(ev) {
            $$('abbr.translate').each(function(el2) {
                el2.removeClass('active')
            });
            el.getParent().addClass('active');
        });
        el.addEvent('keyup', function() {
            tl.update();
            if (el.innerHTML != el.getParent().get('data-original') && el.getParent().get('data-is-fallback')) {
                el.getParent().set('data-needs-translation', 'no');
                el.getParent().set('data-original', '');
            }
        });
    });
    $$('abbr.translate').each(function(el) {
        var self = el;
        el.addEvent('click', function(ev) {
            $$('abbr.translate').each(function(el2) {
                el2.removeClass('active')
            });
            el.addClass('active');
            if (document.body.hasClass('show-toolbar') === true) {
                ev.preventDefault();
                ev.stopPropagation();
                return false;
            }
            return true;
        });
        el.getElements('.markAsTranslated').each(function(el) {
            el.addEvent('click', function(ev) {
                ev.preventDefault();
                tl.markAsTranslated(self);
            });
        });
    });
    $$('button.saveTranslations').each(function(el)  {
        el.addEvent('click', function(ev) {
            ev.preventDefault();
            tl.saveChangedData();
        });
    });
    $$('button.showInvisible').each(function(el) {
        el.addEvent('click', function(ev) {
            ev.preventDefault();
            $$('.translation-hidden').toggleClass('show');
        });
    });
    window.onbeforeunload = function() {
        if (tl.getChangedElements().length > 0) return "You have unsaved translations!";
    };
});
var Translator = new Class({
    getChangedElements: function() {
        var changed = [];
        $$('abbr.translate').each(function(el) {
            var temp = new Element('span');
            temp.innerHTML = el.get('data-original');
            if (temp.innerHTML != el.getElement('.t-content').innerHTML) changed.push(el);
        });
        return changed;
    },
    getChangedData: function() {
        var data = [];
        Array.each(this.getChangedElements(), function(el) {
            el.set('data-newvalue', el.getElement('.t-content').innerHTML);
            data.push(el.dataset);
        });
        return data;
    },
    saveChangedData: function() {
        var changedData = this.getChangedData();
        if (changedData.length == 0) return false;
        if (!confirm(changedData.length + ' strings will be changed, Do you want to continue?')) return false;
        var req = new Request.JSON({
            url: window.baseURL + '/translation/admin_json/savepost',
            onSuccess: function(responseJson) {
                if (responseJson['status'] == 'ok') {
                    window.onbeforeunload = null;
                    location.reload();
                }
            },
            onError: function() {
                alert('Something went boo boo. Please open another tab and make sure that you are logged in.');
            }
        }).post(JSON.encode(changedData));
    },
    update: function() {
        var changedData = this.getChangedData();
        $$('.saveTranslations').each(function(el) {
            if (changedData.length > 0) {
                el.addClass('primaryButton').removeClass('disabledButton');
            } else {
                el.removeClass('primaryButton').addClass('disabledButton');
            }
            el.innerHTML = 'Save translations (' + changedData.length + ')';
        });
    },
    markAsTranslated: function(el) {
        if (el.get('data-is-fallback')) {
            el.set('data-original', '');
            el.set('data-needs-translation', 'no');
            this.update();
            return true;
        }
        new Request.JSON({
            url: window.baseURL + '/translation/admin_json/markpost/entity_id/' + el.get('data-id'),
            onSuccess: function(responseJson) {
                el.set('data-updated', responseJson['updated_at']);
                el.set('data-needs-translation', 'no');
                this.update();
                return true;
            }
        }).get();
        return false;
    }
});