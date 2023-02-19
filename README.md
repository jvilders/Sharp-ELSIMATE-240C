# Sharp-ELSIMATE-240C

As the closer for the foundational course of the [Odin Project](https://www.theodinproject.com), I made a calculator with a user interface using HTML, CSS, and JavaScript. I decided to make it more difficult for myself (much more than I'd expected) by replicating an old calculator I had lying around at home: The Sharp ELSI MATE EL-240C.

![Sharp ELSI MATE EL-240C calculator on wooden desk](./EL240C.jpg)

The main challenge was figuring out a mental model for this calculator; how does it 'think', what does it 'remember' as inputs come in? That proved more difficult than I thought as I repeatedly found new functionality and behavior during my physical testing with the calculator. As far as official documentation goes, there is a [2-page manual for the EL-240S](https://www.manualslib.com/manual/489333/Sharp-El-240s.html?page=1#manual) which wasn't of much use, nor did it document all the functionality of this thing. The extent of my frustration with this thing is borne out by the 83 unit tests for what was supposed to be a simple calculator.

## One learning per language

### JavaScript
This was the first I used the `class` shorthand in a project. Something that's stuck by me is how `this` works very different in JavaScript than in Python: In Python 'pulling out' a method from an instance (e.g. `my_instance.method`) gives you a method object; it comes packed with a reference to the instance, so when calling it later any usage of `self` within the function body will automatically refer to the instance it came from. In JavaScript this isn't the case and you'll have to bind or otherwise provide the intended value for `this` when using the method later. This was relevant within the calculator class where inputs are often mapped to one of several functions, which are methods on the class, that are invoked at a later point.

### HTML
I used Emmett abbreviations to speed up creating multiple similar HTML elements. Not technically a feature of HTML, but definitely cool.

### CSS
I tried to be a bit more structured about defining root variables for things like colors and fonts, so I wouldn't be repeating myself in many CSS rules. Still struggling with proper naming and organization, but I'm hoping more practice will improve that naturally. 