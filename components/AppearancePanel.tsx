export default function AppearancePanel(){

return(

<div className="appearancePanel">

<h3>Background</h3>

<div className="backgroundOptions">

<button className="option active">Shader</button>
<button className="option">Video</button>
<button className="option">Image</button>
<button className="option">Gradient</button>
<button className="option">Solid</button>
<button className="option">Audio</button>

</div>

<h3>Accent Color</h3>

<div className="colorGrid">
<div className="color"/>
<div className="color"/>
<div className="color"/>
<div className="color"/>
<div className="color"/>
</div>

<h3>Button Style</h3>

<div className="buttonStyles">

<button className="style filled">Link Title</button>
<button className="style outline">Link Title</button>
<button className="style glass">Link Title</button>

</div>

<h3>Font Family</h3>

<select>

<option>DM Sans</option>
<option>Inter</option>
<option>Poppins</option>

</select>

</div>

);
}