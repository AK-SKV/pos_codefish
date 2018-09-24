odoo.define('vp_pos_screen.vp_pos_screen', function(require) {

    var screens = require('point_of_sale.screens');
    var models = require('point_of_sale.models');
    var chrome = require('point_of_sale.chrome');
    var session = require('web.session');

    screens.ScreenWidget.include({
        init: function(parent,options){
            this.disable_leftpane = ['receipt', 'payment'];
            this._super(parent,options);
        },
        show: function() {
            this._super();
            this.$leftpane = $('.leftpane');
            this._check_disable_leftpane();
        },
        hide: function() {
            this._super();
            this._check_disable_leftpane();
        },
        _check_disable_leftpane: function() {
            if (this.$leftpane){
                var cur_screen = this.pos.gui.get_current_screen();
                var pos = _.indexOf(this.disable_leftpane, cur_screen);
                if(cur_screen && pos > -1){
                    this.$leftpane.addClass('v-disable-click');
                }
                else if(this.$leftpane.hasClass('v-disable-click')) {
                    this.$leftpane.removeClass('v-disable-click');
                }
            }
        },
    });

    chrome.Chrome.include({
        init: function() {
            this._super.apply(this, arguments);
            this.logo_url = this.get_image_url(session.company_id)
        },
        get_image_url: function(company) {
            return window.location.origin + '/web/image?model=res.company&field=logo&id=' + company;
        },
    });

    screens.OrderWidget.include({
        replace: function($target) {
            this.renderElement();
            var target = $target[0];
            if (target) {
                target.parentNode.replaceChild(this.el, target);
            }
        },
        remove_orderline: function(order_line) {
            if (this.pos.get_order().get_orderlines().length === 0) {
                this.renderElement();
            } else {
                if (order_line.node && order_line.node.parentNode) {
                    order_line.node.parentNode.removeChild(order_line.node);
                }
            }
        },
    });

    screens.ProductScreenWidget.include({
        start: function() {
            var self = this;
            this._super();
            this.actionpad.replace($('.placeholder-ActionpadWidget'));
            this.numpad.replace($('.placeholder-NumpadWidget'));
            this.order_widget.replace($('.placeholder-OrderWidget'));

            var classes = Object.assign({}, this.action_buttons);
            this.action_buttons = {};
            for (var key in classes) {
                var classe = classes[key];
                if (!classe.condition || classe.condition.call(this)) {
                    classe.appendTo($('.control-buttons'));
                    this.action_buttons[key] = classe;
                }
            }
            if (_.size(this.action_buttons)) {
                $('.control-buttons').removeClass('oe_hidden');
            }
        },
        show: function() {
            var order = this.pos.get_order();
            if (order) {
                order.set_numpad_disable(false);
            }
            this._super();
        },
        hide: function() {
            var order = this.pos.get_order();
            if (order) {
                order.set_numpad_disable(true);
            }
            this._super();
        }
    });

    var _super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function(attr, options) {
            this.numpad_disable = true;
            _super_order.initialize.call(this, attr, options);
        },
        set_numpad_disable: function(numpad_disable) {
            this.numpad_disable = numpad_disable
        },
        get_numpad_disable: function() {
            return this.numpad_disable;
        },
        init_from_JSON: function(json) {
            _super_order.init_from_JSON.apply(this, arguments);
            this.set_numpad_disable(true);
        }
    });

    screens.NumpadWidget.include({
        clickDeleteLastChar: function() {
            var order = this.pos.get_order() ? this.pos.get_order() : undefined;
            if (!order || order.get_numpad_disable()) {
                return;
            }
            this._super();
        },
        clickSwitchSign: function() {
            var order = this.pos.get_order() ? this.pos.get_order() : undefined;
            if (!order || order.get_numpad_disable()) {
                return;
            }
            this._super();
        },
        clickAppendNewChar: function(event) {
            var order = this.pos.get_order() ? this.pos.get_order() : undefined;
            if (!order || order.get_numpad_disable()) {
                return;
            }
            this._super(event);
        },
        clickChangeMode: function(event) {
            var order = this.pos.get_order() ? this.pos.get_order() : undefined;
            if (!order || order.get_numpad_disable()) {
                return;
            }
            this._super(event)
        },
    });
});
