#include <furi.h>
#include <gui/gui.h>
#include <input/input.h>

/* This example only draws on the screen and handles the Back button. */
static void signal_path_draw(Canvas* canvas, void* context) {
    UNUSED(context);
    canvas_clear(canvas);
    canvas_set_font(canvas, FontPrimary);
    canvas_draw_str(canvas, 4, 20, "Signal Path");
    canvas_set_font(canvas, FontSecondary);
    canvas_draw_str(canvas, 4, 37, "Predict. Test. Explain.");
    canvas_draw_str(canvas, 4, 56, "Press Back to exit");
}

/* Do not block the input service: deliver events to the application's queue. */
static void signal_path_input(InputEvent* event, void* context) {
    FuriMessageQueue* queue = context;
    furi_message_queue_put(queue, event, 0);
}

int32_t signal_path_app(void* context) {
    UNUSED(context);
    FuriMessageQueue* queue = furi_message_queue_alloc(8, sizeof(InputEvent));
    ViewPort* viewport = view_port_alloc();
    view_port_draw_callback_set(viewport, signal_path_draw, NULL);
    view_port_input_callback_set(viewport, signal_path_input, queue);
    Gui* gui = furi_record_open(RECORD_GUI);
    gui_add_view_port(gui, viewport, GuiLayerFullscreen);

    InputEvent event;
    while(true) {
        if(furi_message_queue_get(queue, &event, FuriWaitForever) == FuriStatusOk &&
           event.key == InputKeyBack && event.type == InputTypeShort) {
            break;
        }
    }

    view_port_enabled_set(viewport, false);
    gui_remove_view_port(gui, viewport);
    view_port_free(viewport);
    furi_message_queue_free(queue);
    furi_record_close(RECORD_GUI);
    return 0;
}
