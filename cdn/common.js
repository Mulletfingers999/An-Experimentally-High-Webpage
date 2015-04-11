var scale = 'cm';
var total = 6082560;
var m = '5280';
//var moved = document.getElementById('page');
var c = 0;
var feet = 0;
var inches = 0;
var units = 0;

//6082560

function show_add()
{
	$('#the_adder').toggle();
}

function scroller(unit)
{
	$(window).scrollTo(unit, {easing:'easeInOutCubic', duration: 3000});
}

function scrollem(unit)
{
	$(window).scrollTo(unit, {easing:'easeInOutCubic', duration: 10000});
}

function reposition_calculator()
{
	c = (typeof(window.pageYOffset) == 'number') ? window.pageYOffset : document.body.scrollTop;

	//c = window.pageYOffset

	var b = (c == (total - ($(window).height() - $('#bot2').height()))) ? total : c;

	$('#readout').html( output_units(b) );
	output_units2(b);

	//alert(moved);
}

function output_units2(move)
{
	var a = make_units((total - move));
	a = (a == 5280) ? "One Mile" : a;

	$('#r_left').html("&nbsp;&nbsp;" + a);
	$('#r_right').html((total - move) + "px &nbsp;&nbsp;");

	return;
}

function output_units(move)
{
	var a = (((total - move) / 96) / 12); // meters
	a = roundNumber(m - a, 3);

	var position = parseInt(($(window).height() - $('#calculator').height()) * (move/total));

	a = (m == 5280) ? "One Mile" : a + 'ft';

	var html = "<span style='font-size: 24px;'>" + a + "</span><br />";
	html += "<span style='font-size: 10px; color: #999;'>" + (move) + "px</span>";

	return html;
}

function roundNumber(num, dec)
{
	var result = Math.round(num*Math.pow(10, dec))/Math.pow(10, dec);

	return result;
}

function switch_scale()
{
	if (scale == 'cm')
	{
		scale = 'in';
		$('#mile').css('background-image', 'url(files/r_in.gif)');
		$('#current_scale').html('Inches');
	}
	else
	{
		scale = 'cm';
		$('#mile').css('background-image', 'url(files/30_cm.gif)');
		$('#current_scale').html('Centimeters');
	}
}

function make_units(amt)
{
	// gives us the feet
	var x = parseInt((amt / 12) / 96);

	// gives us the inches and remainder in px
	var y = (amt - ((x * 12) * 96));

	// convert to inches plus decimal
	var z = (y / 96);

	x = (x >= 1) ? x + ' ft ' : '';
	z = (z >= 0.001) ? roundNumber(z, 3) + ' inches' : '';

	return x + z;
}

function toggler(state)
{
	if (state == 1)
	{
		$('#meters').hide();
		$('#increments').show();
	}
	else
	{
		$('#increments').hide();
		$('#meters').show();
	}
}

function map_fractions(input)
{
	input = ((input * 12) / 1000);
	input = input.toString();

	var zzz = new Array();
	zzz[0] = 0;
	zzz[1] = 0;

	zzz = input.split('.');

	var w = parseInt(zzz[0]);

	input = parseFloat('.' + zzz[1]);

	var xyzz = new Array();

	if ((input >= 0) && (input <= 0.374))
	{
		xyzz[0] = parseInt(w);
		xyzz[1] = parseFloat(.125);
		return xyzz;
	}
	else if ((input >= 0.3741) && (input <= 0.749))
	{
		xyzz[0] = parseInt(w);
		xyzz[1] = parseFloat(.5);
		return xyzz;
	}
	else
	{
		xyzz[0] = parseInt(w);
		xyzz[1] = parseFloat(.75);
		return xyzz;
	}
}

function submit_object()
{
	var rad = $("input[name=a_unit]:checked").val();
	var obj = $('input#a_obj').val();

	ft = 0;
	inches = 0;
	units = 0;

	if (obj == '')
	{
		alert('You need to enter an object.');
		return false;
	}

	if (rad == 2)
	{
		// get the amount
		var m = $('input#a_m').val();

		if (m == '')
		{
			alert('You need to enter an amount.');
			return false;
		}

		m = m.replace(',', '.');
		m = (parseFloat(m) >= 0.009) ? parseFloat(m) : 0;

		if ((m <= 0.009) || (m >= 1609.34))
		{
			alert('This amount will not work.');
			return false;
		}

		var ft = roundNumber(m * 3.2808399, 3);
		var temp = ft.toString();
		var xyz = new Array();
		xyz[0] = 0;
		xyz[1] = 0;
		xyz = temp.split('.');

		// deal with remainders
		if (parseInt(xyz[1]) > 0) var yes = map_fractions(xyz[1]);

		// need to round to three and drop after '.'
		ft = Math.floor(roundNumber(m * 3.2808399, 3));
		inches = yes[0];
		units = yes[1];
	}
	else
	{
		ft = $('input#a_ft').val();
		ft = ft.replace(',', '');
		ft = ft.replace('.', '');
		ft = (parseInt(ft) >= 0) ? parseInt(ft) : 0;
		inches = (parseInt($('input#a_inches').val()) >= 0) ? parseInt($('input#a_inches').val()) : 0;
		inches = (inches >= 12) ? 0 : inches;
		units = ($('select#a_units').val() >= 0) ? roundNumber($('select#a_units').val(), 3) : 0;

		if ((ft > 5280) || (obj == ''))
		{
			alert('Woops, there was a problem.');
			return false;
		}
	}

	var n_height = ((ft * 12) * 96);
	var n_inches = ((inches + units) * 96);
	var px = (n_height + n_inches);
	var totald = make_units((n_height + n_inches));
	var scroll = parseInt(total - px);

	if (px <= 0)
	{
		alert('Woops, there was a problem.');
		return false;
	}

	// off to ajax...return the value and scroll to location...
	$.post('/ndxz-site/onemile/ajax.php', { a : obj, b : px, c : totald },
		function(html) {
			if (html == 'error')
			{
				alert('Error');
			}
			else
			{
				$('#objects').prepend(html);
				//$('#the_adder').hide();
				scroller(scroll);
			}
			return false;
	});
}
