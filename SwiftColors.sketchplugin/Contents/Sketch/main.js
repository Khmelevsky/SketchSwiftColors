@import "util.js";

function save(context) {
	var doc = context.document;
	var app = NSApp.delegate();
	var version = context.plugin.version().UTF8String();

	// Create dialog
	var dialog = NSAlert.alloc().init();
	dialog.setMessageText("Export colors to swift");
	dialog.addButtonWithTitle("Export");
	dialog.addButtonWithTitle("Cancel");

	// Create custom view and fields
	var customView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 200, 180));

	var labelSource = createLabel(NSMakeRect(0, 150, 200, 25), 12, false, 'Source:');
	customView.addSubview(labelSource);

	var selectSource = createSelect(NSMakeRect(0, 125, 200, 25), ["Global colors", "Document colors"])
	customView.addSubview(selectSource);

	function setCheckboxStates(selectSource) {
		if (selectSource.indexOfSelectedItem() == 0) {
			var assets = app.globalAssets();
		} else if (selectSource.indexOfSelectedItem() == 1) {
			var assets = doc.documentData().assets();
		}
	}

	setCheckboxStates(selectSource);

	selectSource.setCOSJSTargetFunction(function(sender) {
		setCheckboxStates(selectSource)
	});

	dialog.setAccessoryView(customView);

	if (dialog.runModal() != NSAlertFirstButtonReturn) {
		return;
	}

	if (selectSource.indexOfSelectedItem() == 0) {
		var assets = app.globalAssets();
	} else if (selectSource.indexOfSelectedItem() == 1) {
		var assets = doc.documentData().assets();
	}

	var colors = assets.colors();

	if (colors.length <= 0) {
		NSApp.displayDialog("No presets available!");
		return;
	}

	var save = NSSavePanel.savePanel();
	save.setNameFieldStringValue("untitled.swift");
	save.setAllowedFileTypes(["swift"]);
	save.setAllowsOtherFileTypes(false);
	save.setExtensionHidden(false);

	if (save.runModal()) {
		var result = "";

		for (var i = 0; i < colors.length; i++) {
      result += "static let hex" + colorToHex(colors[i].red() * 255,colors[i].green() * 255,colors[i].blue() * 255) + "_" + (100 * colors[i].alpha()) + " = UIColor(red:" + round(colors[i].red()) + ", green:" + round(colors[i].green()) + ", blue:" + round(colors[i].blue()) + ", alpha:" + colors[i].alpha() + ")\n";
		}
		var filePath = save.URL().path();
		var file = NSString.stringWithString(result);

		file.writeToFile_atomically_encoding_error(filePath, true, NSUTF8StringEncoding, null);
	}
}
