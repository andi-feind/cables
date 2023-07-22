const
    data = op.inObject("data"),
    key = op.inString("Key"),
    result = op.outString("Result");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

op.setUiAttrib({ "extendTitlePort": key.name });

key.onChange =
data.onChange = exec;

function exec()
{
    if (data.get())
    {
        result.set(String(data.get()[key.get()]));
    }
    else
    {
        result.set(null);
    }
}
