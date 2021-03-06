/*
	Fixing paragraph style combinations
	Version: 1.2.B
	
    Script by Thomas Silkjær
	http://indesigningDOTnet/
	
	Minor version B: Bruno Herfst 
	+ added any style to replace paragraphs
	+ Can cancel
	
*/

#target indesign;


var the_document = app.documents.item(0);

// Create a list of paragraph styles
var list_of_paragraph_styles = [];
var all_paragraph_styles = [];
	
for(i = 0; i < the_document.paragraphStyles.length; i++) {
	list_of_paragraph_styles.push(the_document.paragraphStyles[i].name);
	all_paragraph_styles.push(the_document.paragraphStyles[i]);
}


for(i = 0; i < the_document.paragraphStyleGroups.length; i++) {
	for(b = 0; b < the_document.paragraphStyleGroups[i].paragraphStyles.length; b++) {
		list_of_paragraph_styles.push(the_document.paragraphStyleGroups[i].name+'/'+the_document.paragraphStyleGroups[i].paragraphStyles[b].name);
		all_paragraph_styles.push(the_document.paragraphStyleGroups[i].paragraphStyles[b]);
	}
}

var list_of_replace_paragraph_styles = list_of_paragraph_styles.slice(0);
	list_of_replace_paragraph_styles.unshift("[Any paragraph style]");

// Make the dialog box for selecting the paragraph styles
var the_dialog = app.dialogs.add({name:"Fix paragraph style pairs"});
with(the_dialog.dialogColumns.add()){
	with(dialogRows.add()){
		staticTexts.add({staticLabel:"Find:"});
	}
	with(borderPanels.add()){
		var find_first_paragraph = dropdowns.add({stringList:list_of_paragraph_styles, selectedIndex:0});
		staticTexts.add({staticLabel:"followed by"});
		var find_second_paragraph = dropdowns.add({stringList:list_of_replace_paragraph_styles, selectedIndex:0});
	}
	with(dialogRows.add()){
		staticTexts.add({staticLabel:"Change:"});
	}
	with(borderPanels.add()){
		var change_first_paragraph = dropdowns.add({stringList:list_of_paragraph_styles, selectedIndex:0});
		staticTexts.add({staticLabel:"followed by"});
		var change_second_paragraph = dropdowns.add({stringList:list_of_paragraph_styles, selectedIndex:0});
	}
	with(dialogRows.add()){
		var searchDoc = checkboxControls.add({ staticLabel : 'All stories', checkedState : true});
	}
}

if(the_dialog.show()){
	// Define paragraph styles
	var find_first_paragraph = all_paragraph_styles[find_first_paragraph.selectedIndex];
	var anyStyle = false;
	if(find_second_paragraph.selectedIndex == 0){
		anyStyle = true;
	}
	var find_second_paragraph = all_paragraph_styles[find_second_paragraph.selectedIndex-1];
	var change_first_paragraph = all_paragraph_styles[change_first_paragraph.selectedIndex];
	var change_second_paragraph = all_paragraph_styles[change_second_paragraph.selectedIndex];

	// Set find grep preferences to find all paragraphs with the first selected paragraph style
	app.findChangeGrepOptions.includeFootnotes = false;
	app.findChangeGrepOptions.includeHiddenLayers = false;
	app.findChangeGrepOptions.includeLockedLayersForFind = false;
	app.findChangeGrepOptions.includeLockedStoriesForFind = false;
	app.findChangeGrepOptions.includeMasterPages = false;

	app.findGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.appliedParagraphStyle = find_first_paragraph;
	app.findGrepPreferences.findWhat = "$";

	// Search scope
	if(searchDoc.checkedState) {
		var the_story = app.selection[0].parentStory;
	} else {
		var the_story = the_document;
	}

	var found_paragraphs = the_story.findGrep();

	var change_first_list = [];
	var change_second_list = [];

	// Loop through the paragraphs and create a list of words and mark them as index words
	myCounter = 0;
	do {
		try {
			// Create an object reference to the found paragraph and the next
			var first_paragraph = found_paragraphs[myCounter].paragraphs.firstItem();
			var next_paragraph = first_paragraph.paragraphs[-1].insertionPoints[-1].paragraphs[0];
			
			if(anyStyle){
				change_first_list.push(first_paragraph);
				change_second_list.push(next_paragraph);
			} else {			
				// Check if the next paragraph is equal to the find_second_paragraph
				if(next_paragraph.appliedParagraphStyle == find_second_paragraph) {
						change_first_list.push(first_paragraph);
						change_second_list.push(next_paragraph);
				}
			}
		} catch(err) {}
		myCounter++;
	} while (myCounter < found_paragraphs.length); 
	
	// Apply paragraph styles
	myCounter = 0;
	do {
		change_first_list[myCounter].appliedParagraphStyle = change_first_paragraph;
		change_second_list[myCounter].appliedParagraphStyle = change_second_paragraph;
		myCounter++;
	} while (myCounter < change_first_list.length);

}