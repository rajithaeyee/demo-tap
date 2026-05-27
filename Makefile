NAME    := demo-tap
ZIP     := $(NAME).zip
BUILD   := build

ASSETS  := manifest.json popup.html popup.css

.PHONY: all package build install clean

all: package

install: node_modules

node_modules: package.json package-lock.json
	npm install
	@touch node_modules

build: install
	@rm -rf $(BUILD)
	npx tsc
	cp $(ASSETS) $(BUILD)/
	cp -r icons $(BUILD)/

package: build
	@rm -f $(ZIP)
	cd $(BUILD) && zip -rq ../$(ZIP) .
	@echo
	@echo "Built: $(BUILD)/    (load unpacked in chrome://extensions)"
	@echo "Built: $(ZIP)       (upload to Chrome Web Store)"

clean:
	rm -rf $(BUILD) $(ZIP)
