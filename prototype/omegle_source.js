var contentTop;
window.addEvent("domready", function () {
    $$("#chatbutton img").addEvent("click", function () {
        contentTop = $("intro").offsetTop;
        $("intro").dispose();
        startNewChat()
    });
    var a = $$("#feedback h2");
    if (location.hash == "#feedback") {
        $("feedback").addClass("expanded");
        $("feedbackmessage").focus()
    } else {
        $("feedback").addClass("collapsed")
    }
    a.addEvent("click", function () {
        if ($("feedback").hasClass("expanded")) {
            $("feedback").removeClass("expanded");
            $("feedback").addClass("collapsed")
        } else {
            $("feedback").removeClass("collapsed");
            $("feedback").addClass("expanded")
        }
    });
    startUserCounter()
});

function setFavicon(a) {
    $$("link[rel=icon]").dispose();
    var b = new Element("link");
    b.rel = "icon";
    b.type = "image/png";
    b.href = a;
    $$("head")[0].grab(b)
}

function killHeaders(a) {
    delete a.headers["X-Requested-With"];
    delete a.headers["X-Request"];
    return a
}

function startUserCounter() {
    var d = new Element("div", {
        id: "onlinecount"
    });
    $("header").grab(d);

    function b() {
        setTimeout(a, 120000)
    }

    function c(e) {
        d.set("text", e + " users online");
        b()
    }

    function a() {
        killHeaders(new Request({
            url: "/count?rand=" + Math.random(),
            method: "get",
            onSuccess: c,
            onFailure: b
        })).send()
    }
    a()
}

function startNewChat() {
    if ($("appstore")) {
        $("appstore").destroy()
    }
    $(document.body).addClass("inconversation");
    var x = new Element("div", {
        "class": "chatbox"
    });
    var s = new Element("div", {
        "class": "logwrapper",
        styles: {
            top: contentTop + "px"
        }
    });
    var h = new Element("div", {
        "class": "logbox"
    });
    s.grab(h);
    x.grab(s);
    var r = new Element("div", {
        "class": "controlwrapper"
    });
    var e = new Element("table", {
        "class": "controltable",
        cellpadding: "0",
        cellspacing: "0",
        border: "0"
    });
    var k = new Element("tbody");
    var t = new Element("tr");
    var L = new Element("td", {
        "class": "disconnectbtncell"
    });
    var H = new Element("div", {
        "class": "disconnectbtnwrapper"
    });
    var y = new Element("input", {
        value: "Disconnect",
        "class": "disconnectbtn",
        type: "button",
        disabled: true
    });
    y.set("value", "Disconnect");
    H.grab(y);
    L.grab(H);
    t.grab(L);
    var a = new Element("td", {
        "class": "chatmsgcell"
    });
    var n = new Element("div", {
        "class": "chatmsgwrapper"
    });
    var p = new Element("textarea", {
        "class": "chatmsg",
        cols: "80",
        rows: "3",
        disabled: true
    });
    n.grab(p);
    a.grab(n);
    t.grab(a);
    var f = new Element("td", {
        "class": "sendbthcell"
    });
    var B = new Element("div", {
        "class": "sendbtnwrapper"
    });
    var z = new Element("input", {
        "class": "sendbtn",
        type: "button",
        disabled: true
    });
    z.set("value", "Send");
    B.grab(z);
    f.grab(B);
    t.grab(f);
    k.grab(t);
    e.grab(k);
    r.grab(e);
    x.grab(r);
    $(document.body).grab(x);
    var C;
    var E = false;
    var l = false;

    function o() {
        if (l) {
            return
        }
        l = true;
        var N = [
            ["___Omegle___", "/static/favicon.png"],
            ["\xAF\xAF\xAFOmegle\xAF\xAF\xAF", "/static/altfavicon.png"]];
        var O;

        function M() {
            var Q = N.pop();
            document.title = Q[0];
            setFavicon(Q[1]);
            N.unshift(Q);
            O = setTimeout(M, 500)
        }
        M();

        function P() {
            clearTimeout(O);
            l = false;
            document.title = "Omegle";
            setFavicon("/static/favicon.png");
            $(document).removeEvent("mousemove", P);
            $(document).removeEvent("keydown", P);
            $(document).removeEvent("focus", P);
            $(window).removeEvent("mousemove", P);
            $(window).removeEvent("keydown", P);
            $(window).removeEvent("focus", P)
        }
        $(document).addEvent("mousemove", P);
        $(document).addEvent("keydown", P);
        $(document).addEvent("focus", P);
        $(window).addEvent("mousemove", P);
        $(window).addEvent("keydown", P);
        $(window).addEvent("focus", P)
    }

    function i() {
        return h.scrollTop >= h.scrollHeight - h.clientHeight
    }

    function K() {
        h.scrollTop = h.scrollHeight
    }
    var D = null;

    function v(N) {
        var O = new Element("div", {
            "class": "logitem"
        });
        O.grab(N);
        var M = i();
        if (D === null) {
            h.grab(O)
        } else {
            O.inject(D, "before")
        }
        if (M) {
            K()
        }
        return O
    }

    function A(N, M) {
        if (M === undefined || M) {
            o()
        }
        var O = new Element("div", {
            "class": "statuslog"
        });
        O.appendText(N);
        return v(O)
    }

    function J(Q, R) {
        if (Q == "you") {
            var O = "youmsg";
            var P = "You:"
        } else {
            var O = "strangermsg";
            var P = "Stranger:";
            o()
        }
        var S = new Element("div", {
            "class": O
        });
        var N = new Element("span", {
            "class": "msgsource"
        });
        N.appendText(P);
        S.grab(N);
        S.appendText(" ");
        var M = true;
        $each(R.split("\n"), function (T) {
            if (!M) {
                S.grab(new Element("br"))
            }
            M = false;
            S.appendText(T)
        });
        v(S);
        if (Q == "stranger" && (R.indexOf("FBI") !== -1 || R.toLowerCase().indexOf("federal bureau") !== -1)) {
            A("If the above message says you have been reported to the FBI, it is not legitimate. Please ignore it.")
        }
    }

    function w() {
        if (D !== null) {
            D.dispose();
            D = null
        }
    }

    function m() {
        w();
        D = A("Stranger is typing...", false)
    }

    function g() {
        w();
        $(document.body).removeClass("inconversation");
        p.set("disabled", true);
        z.set("disabled", true);
        y.set("disabled", true);
        $(window).removeEvent("beforeunload", d);
        $(window).removeEvent("unload", G);
        E = true;
        var P = new Element("div");
        var O = new Element("input");
        O.type = "submit";
        O.value = "Start a new conversation";
        O.addEvent("click", function () {
            x.dispose();
            startNewChat()
        });
        P.grab(O);
        P.appendText(" or ");
        var N = new Element("a");
        N.set("text", "save this log");
        N.set("href", "#");
        var S = h.get("html");
        var M = new Date();
        var R = M.getFullYear() + "-";
        if (M.getMonth() < 9) {
            R += "0"
        }
        R += (M.getMonth() + 1) + "-";
        if (M.getDate() < 10) {
            R += "0"
        }
        R += M.getDate();
        N.addEvent("click", function (V) {
            V.preventDefault();
            var U = new Element("form");
            U.set("method", "post");
            U.set("action", "/downloadlog");
            U.setStyle("display", "none");
            var T = new Element("input");
            T.set("type", "hidden");
            T.set("name", "date");
            T.set("value", R);
            U.grab(T);
            var W = new Element("input");
            W.set("type", "hidden");
            W.set("name", "log");
            W.set("value", S);
            U.grab(W);
            $(document.body).grab(U);
            U.submit()
        });
        P.grab(N);
        P.appendText(" or ");
        var Q = new Element("a");
        Q.href = "/feedback";
        Q.appendText("send us feedback");
        P.grab(Q);
        P.appendText(".");
        v(P)
    }

    function F(M) {
        $each(M, function (N) {
            switch (N[0]) {
            case "waiting":
                A("Looking for someone you can chat with. Hang on.");
                break;
            case "connected":
                A("You're now chatting with a random stranger. Say hi!");
                p.set("disabled", false);
                z.set("disabled", false);
                p.focus();
                break;
            case "gotMessage":
                w();
                var O = N[1];
                J("stranger", O);
                break;
            case "strangerDisconnected":
                A("Your conversational partner has disconnected.");
                g();
                break;
            case "typing":
                m();
                break;
            case "stoppedTyping":
                w();
                break
            }
        })
    }

    function c(M) {
        if (M == undefined) {
            M = 0
        }
        if (M > 2) {
            A("Connection asploded.");
            g()
        }
        if (E) {
            return
        }
        killHeaders(new Request.JSON({
            url: "/events",
            onSuccess: function (N) {
                if (E) {
                    return
                }
                if (N == null) {
                    A("Connection imploded.");
                    g()
                } else {
                    F(N);
                    c()
                }
            },
            onFailure: function () {
                c(M + 1)
            }
        })).post({
            id: C
        })
    }
    var I = null;

    function q() {
        if (I !== null) {
            clearTimeout(I);
            I = null
        }
    }

    function b() {
        q();
        p.focus();
        var M = p.value;
        if (!M) {
            return
        }
        p.value = "";
        J("you", M);
        killHeaders(new Request({
            url: "/send",
            data: {
                msg: M,
                id: C
            }
        })).send()
    }

    function j() {
        I = null;
        killHeaders(new Request({
            url: "/stoppedtyping",
            data: {
                id: C
            }
        })).send()
    }

    function u() {
        if (I === null) {
            killHeaders(new Request({
                url: "/typing",
                data: {
                    id: C
                }
            })).send()
        }
        q();
        I = setTimeout(j, 15000)
    }
    p.addEvent("keydown", u);

    function G() {
        if (E) {
            return
        }
        killHeaders(new Request({
            url: "/disconnect",
            data: {
                id: C
            }
        })).send();
        A("You have disconnected.");
        g()
    }

    function d(M) {
        M.preventDefault();
        M.event.returnValue = "Leaving this page will end your conversation."
    }
    z.addEvent("click", b);
    y.addEvent("click", function () {
        if (confirm("Are you sure you want to disconnect?")) {
            G()
        }
    });
    p.addEvent("keypress", function (M) {
        if (M.code == 13 && !(M.shift || M.alt || M.meta)) {
            b();
            M.preventDefault()
        }
    });
    A("Connecting to server...");
    killHeaders(new Request.JSON({
        url: "/start",
        onSuccess: function (M) {
            y.set("disabled", false);
            $(window).addEvent("beforeunload", d);
            $(window).addEvent("unload", G);
            C = M;
            c()
        },
        onFailure: function () {
            A("Error connecting to server. Please try again.");
            g()
        }
    })).post()
};
