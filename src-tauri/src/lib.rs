use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

/// Toggle the main window's always-on-top flag from the frontend, e.g. when
/// the user pins the companion so it floats over other apps.
#[tauri::command]
fn set_always_on_top(window: tauri::WebviewWindow, pinned: bool) -> Result<(), String> {
    window.set_always_on_top(pinned).map_err(|e| e.to_string())
}

/// Move the companion window to a specific corner/snap position. `x`/`y`
/// are absolute screen coordinates computed on the frontend (it already
/// knows monitor bounds and the window's own size).
#[tauri::command]
fn move_companion(window: tauri::WebviewWindow, x: i32, y: i32) -> Result<(), String> {
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![set_always_on_top, move_companion])
        .setup(|app| {
            // System tray: show/hide the companion, quit the app. Kept
            // minimal on purpose — most of Koink's surface lives in the
            // window itself, not in tray menus.
            let show_hide = MenuItem::with_id(app, "show_hide", "Show / hide Koink", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Koink", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_hide, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Koink")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show_hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let visible = window.is_visible().unwrap_or(false);
                            if visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running the Koink application");
}
