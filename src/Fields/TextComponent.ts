define('argos/Fields/TextComponent', [
    'dojo/_base/event',
    'dojo/_base/lang',
    'dojo/dom-class',
    '../FieldManager'
], function(
    event,
    lang,
    domClass,
    FieldManager
) {
    var control = React.createClass({
        displayName: 'TextFieldComponent',
        getDefaultProps: function() {
            return {
                notificationTrigger: false,
                validationTrigger: false,
                inputType: 'text',
                enableClearButton: false,
                validInputOnly: false,
                previousValue: null,
                originalValue: null,
                placeHolderText: 'placeholder',
                readonly: false,
                name: 'name',
                label: ''
            };
        },
        getInitialState: function() {
            return null;
        },
        componentWillMount: function() {
            console.log('TextComponent will mount.');
        },
        render: function() {
            var children = [], elem;
            let {label, button, input, div} = React.DOM;
            
            if (this.props.label) {
                children.push(label({ 'for': this.props.name }, this.props.label));
            }

            if (this.props.enableClearButton && !this.props.readonly) {
                children.push(button({'class': 'clear-button', 'onClick': this._onClearClick}, null));
            }

            elem = input({
                'ref': 'inputNode',
                'placeholder': this.props.placeHolderText,
                'class': 'text-input',
                'type': this.props.inputType,
                'onKeyUp': this._onKeyUp,
                'onBlur': this._onBlur,
                'onFocus': this._onFocus,
                'name': this.props.name
            }, null);

            if (this.props.readonly) {
                elem.props.readonly = 'readonly';
            }

            if (this.props.validInputOnly) {
                this.props.onKeyPress = this._onKeyPress;
            }

            children.push(elem);
            return div({ 'className': 'row row-edit' }, children);
        },
        componentDidMount: function() {
        },
        /**
         * Handler for the `onkeypress` event which is not connected unless `validInputOnly` is true.
         *
         * Since this is a direct tie-in for `validInputOnly`, this intercepts the key press, adds it
         * to the current value temporarily and validates the result -- if it validates the key press is
         * accepted, if validation fails the key press is rejected and the key is not entered.
         * @param {Event} evt
         */
        _onKeyPress: function(evt) {
            var v = this.getValue() + evt.keyChar;
            if (this.validate(v)) {
                event.stop(evt);
                return false;
            }
        },
        /**
         * Handler for the `onkeyup` event.
         *
         * If either the `validationTrigger` or `notificationTrigger` is set to `keyup` then it will fire
         * the respective function.
         *
         * @param {Event} evt
         */
        _onKeyUp: function(evt) {
            if (this.validationTrigger === 'keyup') {
                this.onValidationTrigger(evt);
            }

            if (this.notificationTrigger === 'keyup') {
                this.onNotificationTrigger(evt);
            }
        },
        /**
         * Handler for the `onfocus` event.
         *
         * Adds the active styling which is used for detecting state in the clear button click handler.
         *
         * @param evt
         */
        _onFocus: function(evt) {
            domClass.add(this.getDOMNode(), 'text-field-active');
        },
        /**
         * Handler for the `onblur` event
         *
         * If either the `validationTrigger` or `notificationTrigger` is set to `blur` then it will fire
         * the respective function.
         *
         * @param {Event} evt
         */
        _onBlur: function(evt) {
            if (this.validationTrigger === 'blur') {
                this.onValidationTrigger(evt);
            }

            if (this.notificationTrigger === 'blur') {
                this.onNotificationTrigger(evt);
            }

            domClass.remove(this.getDOMNode(), 'text-field-active');
        },
        /**
         * Handler for the `onclick` event for the clear button.
         *
         * Clears the value and attempts to re-open the mobile keyboard display
         *
         * @param {Event} evt
         */
        _onClearClick: function(evt) {
            if (!domClass.contains(this.getDOMNode(), 'text-field-active')) {
                this.clearValue(true);
                event.stop(evt);
            }

            // Mobile browsers listen to either or both events to show keyboard
            this.refs.inputNode.focus();
            this.refs.inputNode.click();
        },
        /**
         * Fires {@link _Field#onChange onChange} if the value has changed since the previous notification event or
         * a direct setting of the value.
         * @param {Event} evt
         */
        onNotificationTrigger: function(evt) {
            var currentValue = this.getValue();

            if (this.previousValue !== currentValue) {
                this.onChange(currentValue, this);
            }

            this.previousValue = currentValue;
        },
        /**
         * Immediately calls {@link _Field#validate validate} and adds the respective row styling.
         * @param {Event} evt
         */
        onValidationTrigger: function(evt) {
            if (this.validate()) {
                domClass.add(this.containerNode, 'row-error');
            } else {
                domClass.remove(this.containerNode, 'row-error');
            }
        },
        /**
         * Returns the input nodes value
         * @return {String}
         */
        getValue: function() {
            return this.refs.inputNode.value;
        },
        /**
         * Sets the value of the input node, clears the previous value for notification trigger and
         * if setting an initial value - set the originalValue to the passed value for dirty detection.
         * @param {String} val Value to be set
         * @param {Boolean} initial True if the value is the default/clean value, false if it is a meant as a dirty value
         */
        setValue: function(val, initial) {
            if (initial) {
                this.originalValue = val;
            }

            this.previousValue = false;

            if (val === null || typeof val === 'undefined') {
                val = '';
            }

            this.set('inputValue', val);
        },
        /**
         * Sets the value of the input node, and set the value as the previous value  so notification trigger will not trigger and
         * if setting an initial value - set the originalValue to the passed value for dirty detection.
         * @param {String} val Value to be set
         * @param {Boolean} initial True if the value is the default/clean value, false if it is a meant as a dirty value
         */
        setValueNoTrigger: function(val, initial) {
            this.setValue(val, initial);
            this.previousValue = this.getValue();
        },
        /**
         * Clears the input nodes value, optionally clearing as a modified value.
         * @param {Boolean} asDirty If true it signifies the clearing is meant as destroying an
         * existing value and should then be detected as modified/dirty.
         */
        clearValue: function(asDirty) {
            var initial = asDirty !== true;

            this.setValue('', initial);
        },
        /**
         * Determines if the value has been modified from the default/original state
         * @return {Boolean}
         */
        isDirty: function() {
            return (this.originalValue !== this.getValue());
        }
    });

    lang.setObject('argos.Fields.TextComponent', control);

    return FieldManager.register('text_component', control);
});
