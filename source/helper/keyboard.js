function keyboard(keyCode, node)
{
    if (!node)
        node = window;

    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;

    key.press = undefined;

    key.down = undefined;
    key.up = undefined;

    key.downHandler = event =>
    {
        if (event.keyCode === key.code)
        {
            if (key.isUp && key.press)
                key.press(event);

            if (key.down && !key.isDown)
                key.down(event);

            key.isDown = true;
            key.isUp = false;
        }

        //event.preventDefault();
    };

    key.upHandler = event =>
    {
        if (event.keyCode === key.code)
        {
            if (key.isDown && key.release)
                key.release(event);

            if (key.up)
                key.up(event);

            key.isDown = false;
            key.isUp = true;
        }

        //event.preventDefault();
    };

    key.downBind = key.downHandler.bind(key);
    key.upBind = key.upHandler.bind(key);

    //Attach event listeners
    key.keydownListener = node.addEventListener('keydown', key.downBind, false);
    key.keyupListener = node.addEventListener('keyup', key.upBind, false);

    key.clear = () =>
    {
        node.removeEventListener("keydown", key.downBind, false);
        node.removeEventListener('keyup', key.upBind, false);
    };

    return key;
}

module.exports = keyboard;