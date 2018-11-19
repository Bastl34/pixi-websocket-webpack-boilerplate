let mp3Support = null;

let uiHelper =
{
    rotate(domObject,angle)
    {
        domObject.style['-webkit-transform'] = 'rotateZ('+ angle +'deg)';
        domObject.style['-moz-transform'] = 'rotateZ('+ angle +'deg)';
        domObject.style['-ms-transform'] = 'rotateZ('+ angle +'deg)';
        domObject.style['transform'] = 'rotateZ('+ angle +'deg)';
    },

    transformByStr(domObject,str)
    {
        domObject.style['-webkit-transform'] = str;
        domObject.style['-moz-transform'] = str;
        domObject.style['-ms-transform'] = str;
        domObject.style['transform'] = str;
    },

    rotateScale(domObject, rotation, scale)
    {
        domObject.style['-webkit-transform'] = 'rotate('+rotation+'deg) scale('+scale+', '+scale+')';
        domObject.style['-moz-transform'] = 'rotate('+rotation+'deg) scale('+scale+', '+scale+')';
        domObject.style['-ms-transform'] = 'rotate('+rotation+'deg) scale('+scale+', '+scale+')';
        domObject.style['transform'] = 'rotate('+rotation+'deg) scale('+scale+', '+scale+')';
    },

    restartCSSAnimation(objectName, className)
    {
        let object = document.querySelector(objectName);

        object.classList.add(className);

        let clone = object.cloneNode(true);
        object.parentNode.replaceChild(clone, object);
    },

    isVisible(id)
    {
        let element = document.querySelector('#' + id);

        if (element.style.visibility !== 'hidden' && element.style.display !== 'none')
            return true;
        else
            return false;
    },

    hide(id, visibilityStyle=true)
    {
        if (id instanceof Object)
        {
            if (visibilityStyle)
            {
                if (id.style.visibility != 'hidden')
                    id.style.visibility = 'hidden';
            }
            else
            {
                if (id.style.display != 'none')
                    id.style.display = 'none';
            }
        }
        else
        {
            let object = document.querySelector(id);

            if (visibilityStyle)
            {
                if (object && object.style.visibility != 'hidden')
                    object.style.visibility = 'hidden';
            }
            else
            {
                if (object && object.style.display != 'none')
                    object.style.display = 'none';
            }
        }
    },

    show(id, visibilityStyle=true)
    {
        if (id instanceof Object)
        {
            if (visibilityStyle)
            {
                if (id.style.visibility != 'visible')
                    id.style.visibility = 'visible';
            }
            else
            {
                if (id.style.display != 'block')
                    id.style.display = 'block';
            }
        }
        else
        {
            let object = document.querySelector(id);

            if (visibilityStyle)
            {
                if (object && object.style.visibility != 'visible')
                    object.style.visibility = 'visible';
            }
            else
            {
                if (object && object.style.display != 'block')
                    object.style.display = 'block';
            }
        }
    },

    clearAllEventListener(oldElement)
    {
        let newElement = oldElement.cloneNode(true);
        oldElement.parentNode.replaceChild(newElement, oldElement);
    },

    toggleClass(selector, tgclass)
    {
        let node = document.querySelector(selector);

        if(node)
           item.classList.toggle(newclass);
    },

    addClass(selector, newclass)
    {
        let node = document.querySelector(selector);

        if(node)
            item.classList.add(newclass);
    },

    removeClass(selector, rmclass)
    {
        let node = document.querySelector(selector);

        if(node)
            item.classList.remove(newclass);
    },

    getQueryParams()
    {
        var items = {},
          params = window.location.search.substring(1).split('&');

        for (var i = params.length - 1; i >= 0; i--)
        {
            let splits = params[i].split('=');

            if (splits.length == 0)
                continue;

            if (splits.length >= 2)
                items[splits[0]] = splits[1];
            else
                items[splits[0]] = true;
        }

        return items;
    },

    isIos()
    {
        if (/iP(hone|od|ad)/.test(navigator.platform) || /iP(hone|od|ad)/.test(navigator.userAgent))
            return true;
        else
            return false;
    },

    isAndroid()
    {
        return navigator.userAgent.match(/Android/i);
    },

    isFirefox()
    {
        return navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
    },

    isWindowsMobile()
    {
        return navigator.userAgent.indexOf('IEMobile') !== -1;
    },

    isMobile()
    {
        return (typeof window.orientation !== "undefined") || uiHelper.isIos() || uiHelper.isAndroid() || uiHelper.isWindowsMobile();
    },

    isMp3Supported()
    {
        if (mp3Support === null)
        {
            //chache check
            var a = document.createElement('audio');
            mp3Support = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
        }

        return mp3Support;
    },

    requestFullscreen()
    {
        if(document.documentElement.requestFullscreen)
            document.documentElement.requestFullscreen();
        else if(document.documentElement.mozRequestFullScreen)
            document.documentElement.mozRequestFullScreen();
        else if(document.documentElement.msRequestFullscreen)
            document.documentElement.msRequestFullscreen();
        else if(document.documentElement.webkitRequestFullscreen)
            document.documentElement.webkitRequestFullscreen();
    },

    exitFullscreen()
    {
        if(document.exitFullscreen)
            document.exitFullscreen();
        else if(document.mozCancelFullScreen)
            document.mozCancelFullScreen();
        else if(document.webkitExitFullscreen)
            document.webkitExitFullscreen();
    },

    isFullscreen()
    {
        return window.innerHeight == screen.height;
    },

    setCookie(cname, cvalue, exdays)
    {
        let d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));

        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },

    getCookie(cname)
    {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');

        for(let i = 0; i <ca.length; ++i)
        {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);

            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return '';
    }
}

module.exports = uiHelper;