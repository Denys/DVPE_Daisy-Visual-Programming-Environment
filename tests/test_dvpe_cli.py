import json
import tempfile
import unittest
from pathlib import Path

from execution import dvpe_cli


class DvpeCliTests(unittest.TestCase):
    def test_export_block_library_includes_nested_utility_blocks(self):
        library = dvpe_cli.build_block_library()
        ids = {block["id"] for block in library["blocks"]}

        self.assertGreaterEqual(library["blockCount"], 119)
        self.assertIn("fsm_4", ids)
        self.assertIn("softclip", ids)
        self.assertNotIn("fsm4", ids)
        self.assertNotIn("soft_clip", ids)

    def test_validate_patch_accepts_minimal_valid_patch(self):
        patch = {
            "version": "1.0.0",
            "patch": {
                "metadata": {
                    "name": "Minimal",
                    "author": "Test",
                    "version": "1.0.0",
                    "targetHardware": "seed",
                    "sampleRate": 48000,
                    "blockSize": 4,
                },
                "blocks": [
                    {
                        "id": "osc",
                        "definitionId": "oscillator",
                        "position": {"x": 0, "y": 0},
                        "parameterValues": {},
                    },
                    {
                        "id": "out",
                        "definitionId": "audio_output",
                        "position": {"x": 200, "y": 0},
                        "parameterValues": {},
                    },
                ],
                "connections": [
                    {
                        "id": "c1",
                        "sourceBlockId": "osc",
                        "sourcePortId": "out",
                        "targetBlockId": "out",
                        "targetPortId": "left",
                        "type": "audio",
                    }
                ],
            },
        }

        result = dvpe_cli.validate_patch_data(patch)

        self.assertTrue(result.ok, result.errors)
        self.assertEqual([], result.errors)

    def test_validate_patch_rejects_unknown_block_id(self):
        patch = {
            "version": "1.0.0",
            "patch": {
                "metadata": {"name": "Bad", "author": "Test", "version": "1.0.0", "targetHardware": "seed"},
                "blocks": [
                    {"id": "bad", "definitionId": "soft_clip", "position": {}, "parameterValues": {}}
                ],
                "connections": [],
            },
        }

        result = dvpe_cli.validate_patch_data(patch)

        self.assertFalse(result.ok)
        self.assertTrue(any('unknown definitionId "soft_clip"' in error for error in result.errors))

    def test_validate_patch_rejects_invalid_connection_port(self):
        patch = {
            "version": "1.0.0",
            "patch": {
                "metadata": {"name": "Bad", "author": "Test", "version": "1.0.0", "targetHardware": "seed"},
                "blocks": [
                    {"id": "osc", "definitionId": "oscillator", "position": {}, "parameterValues": {}},
                    {"id": "out", "definitionId": "audio_output", "position": {}, "parameterValues": {}},
                ],
                "connections": [
                    {
                        "id": "c1",
                        "sourceBlockId": "osc",
                        "sourcePortId": "missing",
                        "targetBlockId": "out",
                        "targetPortId": "left",
                        "type": "audio",
                    }
                ],
            },
        }

        result = dvpe_cli.validate_patch_data(patch)

        self.assertFalse(result.ok)
        self.assertTrue(any('unknown sourcePortId "missing"' in error for error in result.errors))

    def test_generate_fixtures_creates_output_directory_and_valid_files(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_dir = Path(tmp_dir) / "missing" / "prompt_generated"

            generated = dvpe_cli.generate_fixture_files(output_dir=output_dir)

            self.assertEqual(3, len(generated))
            for path in generated:
                self.assertTrue(path.exists(), path)
                result = dvpe_cli.validate_patch_data(json.loads(path.read_text(encoding="utf-8")))
                self.assertTrue(result.ok, result.errors)

    def test_skill_check_reports_stale_catalog_ids(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            skill_a = Path(tmp_dir) / "skill_a.md"
            skill_b = Path(tmp_dir) / "skill_b.md"
            content = "Known stale ids: `soft_clip` and `fsm4`."
            skill_a.write_text(content, encoding="utf-8")
            skill_b.write_text(content, encoding="utf-8")

            result = dvpe_cli.check_skills([skill_a, skill_b])

        self.assertFalse(result.ok)
        self.assertTrue(any("soft_clip" in warning for warning in result.warnings))
        self.assertTrue(any("fsm4" in warning for warning in result.warnings))


if __name__ == "__main__":
    unittest.main()
