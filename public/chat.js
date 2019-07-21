const socket = io();
const hkChat = new Vue({
  el: "#hkchat",
  data: {
    channels: [],
    currentMessage: "",
    messages: [],
    user: {},
    currentChannel: 0,
    activated: null,
    iss: [],
    loading: false
  },
  methods: {
    activate(i) {
      if (this.activated === i) return null;
      this.currentChannel = i;
      this.activated = i;
      this.initSock(i);
      this.loadMessages();
    },
    allowed() {
      return (
        this.user.type === "admin" ||
        this.channels[this.currentChannel].creator_id === this.user._id
      );
    },
    tix(e) {
      if (e.ctrlKey && e.keyCode == 13) {
        e.preventDefault();
        this.sendMessage();
      }
    },
    initSock(i) {
      const d = this;
      const channel_id = d.channels[d.currentChannel]._id;
      if (d.iss.includes(channel_id)) return null;
      d.iss.push(channel_id);
      socket.on("message-" + channel_id, msg => {
        d.messages.push(msg);
        d.bota();
      });
    },
    sendMessage(e) {
      var d = this;
      if (e) e.preventDefault();
      if (!d.currentMessage) return;
      $.post({
        url: "/messages/send",
        data: {
          message: d.currentMessage.trim(),
          channel_id: d.channels[d.currentChannel]._id
        },
        success(v) {
          if (v && v._id) {
            d.currentMessage = "";
            d.bota();
            // d.messages.push(v);
          }
        }
      });
    },
    deleteChannel(channel_id = null) {
      var d = this;
      channel_id = channel_id || d.channels[d.currentChannel]._id;
      d.loading = true;
      $.ajax({
        type: "DELETE",
        url: "/channels/" + channel_id,
        success(v) {
          if (v && v.deleted) {
            d.channels.splice(d.currentChannel, 1);
            if (!d.activate(0)) {
              d.currentChannel = 0;
              d.loadMessages();
            }
          }
          d.loading = false;
        }
      });
    },
    loadChannels() {
      var d = this;
      $.getJSON("/channels/all", function(s) {
        d.channels = s;
        if (s.length > 0) {
          d.loadMessages();
          d.activate(0);
        }
      });
    },
    loadMessages(channel_id = null) {
      var d = this;
      d.loading = true;
      d.messages = [];
      if (d.channels.length > 0) {
        channel_id = channel_id || d.channels[d.currentChannel]._id;
        $.getJSON("/messages/" + channel_id + "/all", function(m) {
          if (m.messages) d.messages = m.messages;
          d.loading = false;
          // setTimeout(d.bota, 1000);
        });
      }
    },
    loadCurrentUser() {
      var d = this;
      d.loading = true;
      $.getJSON("/users/current", function(user) {
        d.user = user;
        d.loading = false;
      });
    },
    ucProceed(e) {
      e.preventDefault();
      var dv = $(e.target);
      var t = this;
      var channel = t.channels[t.currentChannel];
      d.loading = true;
      $.post({
        url: "/channels/" + channel._id,
        data: dv.serialize(),
        success(d) {
          if (d && d.updated) {
            $(dv.data("modal")).modal("hide");
          }
          d.loading = false;
        }
      });
    },
    ccProceed(e) {
      e.preventDefault();
      var dv = $(e.target);
      var t = this;
      if (!$("#mc02").val()) return alert("Please enter a name!");
      t.loading = true;
      $.post({
        url: "/channels/create",
        data: dv.serialize(),
        success: function(d) {
          t.loading = false;
          if (d && d._id) {
            t.channels.push(d);
            t.activate(t.channels.length - 1);
            $(dv.data("modal")).modal("hide");
          }
          if (d && d.captchaError) {
            alert(d.error);
          }
          t.reloadCaptcha();
        }
      });
    },
    reloadCaptcha() {
      var html =
        '<img src="/captcha?t=' + Date.now() + '" alt="Captcha image">';
      var k = $(".captchaImage");
      k.html(html);
      k.next("input").val("");
    },
    join(e) {
      var d = this;
      e.preventDefault();
      var channel = d.channels[d.currentChannel];
      if (!channel.members.includes(d.user._id)) {
        d.loading = true;
        $.post({
          url: "/channels/" + channel._id + "/join",
          success: function(ve) {
            if (ve.joined) {
              d.channels[d.currentChannel].members.push(d.user._id);
            }
            d.loading = false;
          }
        });
      }
    },
    formatM(cat) {
      var v = new Date(cat);
      v = v.toLocaleTimeString();
      return v;
    },
    bota() {
      if ($("#messages").length > 0) {
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
      }
    },
    changePassword(e) {
      e.preventDefault();
      const dv = $(e.target);
      const d = this;
      $.post({
        url: "/users/changePassword",
        data: dv.serialize(),
        success(v) {
          if (v && v.changed) {
            $(dv.data("modal")).modal("hide");
            alert("Password was successfuly changed!");
          }
          if (v && v.cpe) {
            alert(v.error);
          }
          dv[0].reset();
        }
      });
    }
  },
  created: function() {
    this.loadCurrentUser();
    this.loadChannels();
  },
  updated: function() {
    let d = this;
    d.$nextTick(function() {
      d.bota();
    });
  }
});
