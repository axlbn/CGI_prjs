# Practical Lesson 3 - Interaction: Placing, Panning and Zooming

## Introduction

Every application so far has drawn something decided in advance: a
triangle, a square, a fixed pattern. In this session we let the mouse
decide. You will build a small drawing application, clicking to place
points and triangles on the canvas, then extend it so the whole view can
be dragged around and zoomed, while the shapes stay exactly where you put
them.

None of this needs anything beyond what you already know - buffers,
attributes, varyings - but it introduces a piece that has not come up yet:
turning a mouse position, given in pixels from the corner of the canvas,
into the clip-space coordinates your vertex shader understands. Get that
conversion right once and everything else in this lesson builds on it
directly.

## ex12 - Placing points with the mouse

Copy the [ex01](../../src/labs/ex01/) folder to a new folder named
my-ex12. Remove the triangle: we will build up the scene from nothing.

A mouse click inside the canvas fires a `click` event, and
`event.offsetX` / `event.offsetY` give the position of the pointer,
in pixels, measured from the **top-left corner** of the canvas. Your
vertex shader, on the other hand, expects clip-space coordinates: both
axes running from -1 to 1, with the origin at the **centre** of the
canvas and the y axis pointing **up**. Converting one into the other is
two short calculations:

```js
function to_clip_space(x, y) {
    return vec2(
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2   // flipped: pixels grow downward, clip space grows upward
    );
}
```

Keep an ordinary JavaScript array of the points placed so far. Each time
the canvas receives a `click` event, convert the event's coordinates and
push the result onto that array:

```js
const points = [];

canvas.addEventListener("click", (event) => {
    points.push(to_clip_space(event.offsetX, event.offsetY));
    update_buffer();
});
```

`update_buffer()` should do exactly what `setup()` already does once for
the fixed triangle in [ex01](../../src/labs/ex01/): bind the buffer and
call `gl.bufferData()` with the flattened array. There is no harm in
re-sending the whole array on every click - it is a handful of points,
added one at a time by a human, not thousands of them every frame.

Draw the points with `gl.drawArrays(gl.POINTS, 0, points.length)`
instead of `gl.TRIANGLES`. You will also need to set the predefined
variable `gl_PointSize` in the vertex shader - try 8.0 - or your points
will be a single pixel each and hard to see. Give the fragment shader a
fixed colour for now; every point the same colour is fine here.

Click around the canvas a few times and confirm a point appears exactly
under the pointer, not offset or mirrored - if it is, the most likely
culprit is a missing or backwards y-flip in `to_clip_space`.

## ex13 - Triangles with interpolated colours

Copy your ex12 solution to a new folder called my-ex13. Instead of
committing a point on every click, accumulate clicks in groups of three:
the first two clicks of a group are remembered but not yet drawn, and the
third completes a triangle, which is added to the list of triangles to
draw, after which the next click starts a new group.

Give each of the three vertices of a triangle its own colour, chosen at
random when the vertex is placed:

```js
function random_color() {
    return vec3(Math.random(), Math.random(), Math.random());
}
```

Pass position and colour as two attributes, as you did in
[ex09](../../src/labs/ex09/), and declare a varying in the vertex shader
so the fragment shader receives a colour interpolated across the triangle,
exactly as in that exercise - only now the three vertices arrive one
mouse click at a time instead of all at once from a fixed array.

Place two or three triangles and confirm each shows a smooth gradient
between its three corner colours, and that starting a new triangle does
not disturb the ones already drawn.

## ex14 - Panning the view

Copy your ex13 solution to a new folder called my-ex14. We want dragging
the mouse across empty canvas to slide the whole view - all the triangles
drawn so far - without adding a new vertex where the drag started.

**A coordinate system of its own.** Until now, `to_clip_space()` produced
values that went straight into `a_position` and straight into
`gl_Position` - the positions you stored *were* clip-space coordinates,
because nothing ever separated "where a vertex is" from "where it is
currently drawn". Panning is exactly the thing that pulls those two apart:
a vertex placed before a drag must keep the same stored position and still
end up somewhere else on screen. From here on, `a_position` holds **world
coordinates** - a unit of your own choosing, fixed for the life of the
application and unrelated to both pixels and clip space - and the vertex
shader's job grows by one step: converting world coordinates into clip
space, using the current view.

Pick a `WORLD_HALF_WIDTH` constant - 10.0 is a reasonable choice - saying
how much of the world is visible across the canvas when the view is
neither panned nor zoomed. Rename `to_clip_space()` to `to_world()`: it
still starts from the same pixel-to-`[-1,1]` calculation as before, but
now scales that by `WORLD_HALF_WIDTH` (and, once a view offset exists,
shifts it by that offset) to land in world units instead of clip units.
The vertex shader does the reverse: given `u_center` (the view's position,
in world units) and `u_world_half_width`, it computes

```c
gl_Position = vec4((a_position.xy - u_center) / u_world_half_width, 0.0, 1.0);
```

**Telling a click from a drag.** A `mousedown` on the canvas can no longer
commit straight to "add a vertex here": it might be the start of a drag.
The usual way to tell the two apart is to wait and see what happens next,
deciding only when the mouse button comes back up - moving on only once
the pointer has travelled more than a small threshold, say 4 pixels, from
where the button went down.

There is a trap here worth knowing about in advance. If you pan only by
each mousemove event's own small step once the threshold is crossed, the
first few pixels of the drag - the ones spent deciding whether it *was* a
drag - never get applied, and every drag falls a little short of the
mouse. The fix is to remember not just where the drag started, but where
the *last processed* point was: the very first pan you apply, at the
moment the threshold is crossed, should cover the whole distance from the
original `mousedown`, not just the latest tiny step. After that, ordinary
per-event steps are enough, since there is no more catching up to do.

`pan()` should not touch the coordinates already stored for any vertex -
only `u_center` changes. Convert the pixel distance dragged into world
units before adding it to `center`: one screen pixel is worth
`(2 * WORLD_HALF_WIDTH) / canvas.width` world units at the default zoom.
(ex15 will need this ratio to depend on the current zoom too, so keep it
as a named quantity rather than folding it into the arithmetic.)

Check two things when you are done: a triangle drawn before you started
panning ends up in exactly the position you dragged it to, in whichever
direction and by however many pixels you moved the mouse - a slow, careful
drag and a fast, jerky one covering the same net distance should leave it
in the same place - and clicking (without dragging) still places a new
vertex exactly under the pointer, in world coordinates, accounting for
the current pan.

## ex15 - Zooming the view

Copy your ex14 solution to a new folder called my-ex15. Add a `scale`
variable and a matching `u_scale` uniform, and change `scale` in response
to the mouse wheel:

```js
let scale = 1.0;

window.addEventListener("wheel", (event) => {
    scale = Math.min(4.0, Math.max(0.2, scale * (1 + event.deltaY / 1000)));
});
```

The clamping keeps the view from growing so large that everything
vanishes off-screen, or shrinking to nothing. `scale` multiplies how much
world is visible: the vertex shader's conversion from ex14 gains one
factor,

```c
gl_Position = vec4((a_position.xy - u_center) / (u_scale * u_world_half_width), 0.0, 1.0);
```

and `to_world()` needs the same factor, for the same reason as always: a
click, after zooming, should still land exactly under the pointer, in
world coordinates - not wherever the raw pixel-to-`[-1,1]` calculation
would put it before scaling is accounted for.

There is a second place `scale` has to appear, easy to miss because
nothing will look obviously wrong if you skip it: `pan()`. However zoomed
in the view is, dragging should still feel the same - the point under the
pointer at the start of a drag should still be under it at the end. Zoomed
out, one screen pixel corresponds to *more* world distance than it does at
the default zoom; zoomed in, less. The "world units per screen pixel"
quantity from ex14 needs multiplying by `scale` to stay correct at every
zoom level, not only at the one you happened to test it at.

## ex16 - Drawing modes

Copy your ex15 solution to a new folder called my-ex16. So far, one click
always means one vertex of a triangle. Generalise that: a mode, selected
by the keys **'1'**, **'2'** and **'3'** and remaining in effect until the
user presses another of the three, decides how many vertices make up one
shape and what primitive it is drawn with:

| Mode | Key | Vertices per shape | Primitive |
|---|---|---|---|
| Points | `1` | 1 | `gl.POINTS` |
| Line segments | `2` | 2 | `gl.LINES` |
| Triangles | `3` | 3 | `gl.TRIANGLES` |

The accumulate-until-you-have-enough-vertices logic from ex13 barely
changes - it just needs to ask the current mode how many vertices a shape
needs instead of assuming three. Give line segments, like triangles, a
random colour per endpoint and let it interpolate along the segment.

Pan and zoom must keep working, unchanged, in every mode. Switching mode
mid-drag, or with an incomplete shape half-clicked, is not something you
need to handle gracefully - finishing or discarding the pending shape
before switching is a reasonable simplification.

## Challenges for autonomous study

The problems below are optional and are not solved during the session.
They build directly on ex16.

### prob09 - Rubber-band rectangles

Add a fourth mode that draws axis-aligned rectangles: press and drag from
one corner to the opposite one, with the rectangle updating live, corner
to current pointer position, while the mouse button is held down, and
committed on release.

### prob10 - Undo

A key removes the most recently completed shape, whatever mode it was
drawn in. Keeping shapes in a single ordered list, tagged with which mode
produced them, is enough to make this a small addition.

### prob11 - Moving a shape

Let the user drag an existing shape by clicking anywhere inside it -
inside its bounding box is a reasonable approximation for lines and
points, and does not need to be exact for triangles either - and moving
every one of its vertices together, keeping their relative positions and
colours fixed.

### prob12 - Open-ended polygons

Let a click add a vertex to a polygon that stays open - drawn as a fan
from its first vertex - until a chosen key closes it, at which point it
is committed with the fan filled and its vertices' colours interpolated
across it, and a new, empty polygon is ready to start.
